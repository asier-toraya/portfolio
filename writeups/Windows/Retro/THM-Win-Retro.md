# Write-up Retro

**Autor**: Asier González

## Reconocimiento

1. Empiezo con un escaneo hasta el puerto 10.000
`nmap -sC -sV -O -p 1-10000 -T4 10.129.175.126 -Pn -A`

Descubro 2 puertos abiertos:

- 80/tcp - http IIS 10.0
- 3389/tcp - ms-wbt-server Microsoft Terminal Services

Y que la máquina es Windows Server 2016

![nmap](images/nmap.png)

---
## Enumeración

Accedo a la web y veo que es una página de inicio de IIS.

Decido usar gobuster para enumerar directorios:
`gobuster dir -u http://IP -w /usr/share/wordlists/dirb/common.txt`

Pero no encuentro nada con la lista de "common.txt", así que pruebo con "directory-list-2.3-medium.txt"

En esta ocasion encuentra los directorios de:

- /retro
- /Retro

![gobuster](images/gobuster.png)


Al entrar en la web "/retro" veo que es un blog que administra un tal "Wade" que es fan de Ready Player One. En uno de sus posts deja caer que todavía usa el nombre de su avatar cuando intenta iniciar sesión.

![Wade](images/wade.png)

Buscando un poco la referencia a Wade en *Ready Player One*, encuentro que el protagonista es `Wade Owen Watts` y que su nombre en OASIS es `Parzival`.


## Explotación

Abro `remmina` para conectarme por RDP a la máquina.

Las credenciales que funcionan son: `wade - parzival`

Conseguimos acceso a la máquina.

![login](images/login.png)


## Post-Explotación

Compruebo que usuario soy y que permisos tengo:

```bash
whoami /priv
whoami
```

![whoami](images/whoami.png)

Veo que apenas tengo permisos, así que toca investigar la máquina y buscar una forma de escalado de privilegios.

Al entrar en google chrome desde el escritorio veo que hay un bookmark con un CVE.

![bookmark](images/bookmark.png)

Busco el CVE y veo que es una vulnerabilidad de escalado de privilegios mediante certificado.

![CVE](images/cve.png)

Sigo investigando la máquina y encuentro en la papelera de reciclaje un archivo llamado "hhupd.exe" que es un programa que se ejecuta como administrador.

![hhupd](images/hhupd.png)

Tras restaurarlo de la papelera, lo ejecutamos, nos sale una ventana para ver el certificado del publisher, y desde ahí intentar abrir el enlace del publisher, pero parece que no funciona ya que no nos deja abrir el certificado del publisher con Internet.

![certificate](images/certificate.png)

![certificate2](images/certificate2.png)

![error-certificate](images/error-certificate.png)

## Escalada de privilegios

Así que lo que se me ocurrió fue buscar algun xploit que pudiera servirme para escalar privilegios para Windows Server 2016 (10.0 Build 14393) y encuentro este: `https://github.com/SecWiki/windows-kernel-exploits/blob/master/CVE-2017-0213/CVE-2017-0213_x64.zip`

Me lo bajo, lo descomprimo y se lo paso por http a la maquina victima.

![tranfercve](images/tranfercve.png)

Ejecutamos ese exploit en la maquina victima desde una cmd y nos abre una nueva shell con privilegios de SYSTEM.

![root](images/root.png)
