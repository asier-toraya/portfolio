# Write-up Anthem

**Autor**: Asier González

## Reconocimiento

Empiezo con un escaneo básico para identificar puertos y servicios:

`nmap -sC -sV -p- -Pn IP`

Puertos encontrados:

- `80/tcp` (HTTP)
- `3389/tcp` (RDP)

![nmap](images/nmap.png)

Después enumero directorios web con `gobuster`:

`gobuster dir -u http://IP -w /usr/share/wordlists/dirb/common.txt`

Directorios interesantes encontrados:

- `robots.txt`
- `sitemap`

![gobuster](images/gobuster.png)

## Enumeración

Al revisar `robots.txt`, encuentro dos pistas importantes:

- Posible contraseña: `UmbracoIsTheBest!`
- Ruta interesante: `/umbraco/`

![robots.txt](images/robots.png)

Después inspecciono la web principal. En uno de los artículos, `We are hiring`, aparece una usuaria llamada `Jane Doe` y se indica su email:

- `JD@anthem.com`

![JD](images/JD.png)

En otro artículo comentan que el administrador escribe poesía. Buscando el poema en Google, veo que el autor es `Solomon Grundy`, así que deduzco que sus iniciales y posible usuario son:

- `SG`
- `SG@anthem.com`

## Explotación

Con la contraseña de `robots.txt` pruebo acceso al panel de Umbraco:

- Usuario: `SG`
- Contraseña: `UmbracoIsTheBest!`

Accedo a `/umbraco`, pero desde ahí no encuentro una vía directa para comprometer el sistema.

![login](images/login.png)

Como el puerto `3389` estaba abierto, pruebo acceso por RDP. El formato `SG@anthem.com` no funciona, pero con el usuario `SG` sí consigo entrar:

- Usuario RDP: `SG`
- Contraseña: `UmbracoIsTheBest!`

![remmina](images/remmina.png)

## Post-Explotación

Una vez dentro del sistema, reviso el contenido del equipo y encuentro una carpeta oculta llamada:

- `backups`

Dentro hay un archivo llamado:

- `restore`

Pero inicialmente no tengo permisos para abrirlo.

![backups](images/backups.png)

La solución consiste en modificar los permisos del archivo desde:

- `Propiedades > Security > Edit > Add`

Ahí añado el usuario `SG`, pulso en `Check Names` y le doy permisos de lectura y ejecución.

![adduser](images/adduser.png)
![checknames](images/checknames.png)
![useradded](images/useradded.png)

Después ya puedo abrir el archivo `restore`, donde encuentro una nueva credencial:

- `ChangeMeBaby1MoreTime`

![restorepass](images/restorepass.png)

## Escalada de privilegios

Entiendo que esa contraseña puede pertenecer al administrador. Pruebo a abrir una PowerShell como administrador e introduzco esa contraseña.

La autenticación funciona y consigo una PowerShell elevada.

![adminps](images/adminps.png)

## Resultado

La máquina se compromete usando credenciales expuestas en `robots.txt` para acceder primero a Umbraco y luego por RDP como `SG`. Después, modificando permisos sobre el archivo `restore`, recupero la contraseña `ChangeMeBaby1MoreTime`, que me permite abrir una PowerShell como administrador.
