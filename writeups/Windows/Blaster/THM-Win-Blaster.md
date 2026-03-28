# Write-up Blaster

## Reconocimiento

Empiezo con un escaneo bastante completo para ver qué servicios expone la máquina:

```bash
nmap -sC -sV -p- -T4 --script vuln -Pn IP
```

Veo que el puerto `80` está abierto, así que entro por navegador. Lo que aparece es la página por defecto de Microsoft IIS.

![nmap](images/nmap.png)
![IIS](images/IIS.png)

Pruebo con `/robots`, pero no encuentro nada útil. Así que paso a enumerar directorios con `gobuster`:

```bash
gobuster dir -u http://IP -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

El escaneo devuelve dos rutas:

- `/retro`
- `/Retro`

![Gobuster](images/gobuster.png)

Al entrar en `/retro`, veo una página temática de juegos retro.

## Enumeración

Revisando los posts, veo que están escritos por un usuario llamado `Wade`.

En uno de ellos comenta que siente una conexión fuerte con el protagonista y que todavía usa el nombre de su avatar cuando intenta iniciar sesión. Esa pista apunta bastante claro a credenciales débiles o reutilizadas.

Buscando la referencia a Wade en *Ready Player One*, encuentro que el protagonista es `Wade Owen Watts` y que su nombre en OASIS es `Parzival`.

Con eso en mente, ya tengo una combinación muy probable para probar por RDP.

![Wade](images/wade.png)

## Explotación

Pruebo acceso por RDP con Microsoft Remote Desktop.

Primero intento usar `Watts` como contraseña, pero no funciona. Después pruebo con `parzival` y esta vez sí consigo entrar.

![Parzival](images/parzival.png)
![Login](images/login.png)

Una vez dentro, encuentro el archivo `user.txt` con la primera flag:

```text
THM{HACK_PLAYER_ONE}
```

## Post-explotación

Ya con acceso al sistema, abro PowerShell y saco información básica del host con:

```powershell
systeminfo
```

Los datos más importantes son estos:

```text
Microsoft Windows Server 2016 Standard
OS Version: 10.0.14393 N/A Build 14393
```

![Systeminfo](images/systeminfo.png)

También reviso mis privilegios con:

```powershell
whoami /priv
```

![Whoami](images/whoami.png)

Veo que sigo siendo un usuario normal, así que me toca enumerar más a fondo para encontrar una vía de escalada clara.

### Enumeración con WinPEAS

Decido pasar `winPEAS` desde mi Kali. Para ello levanto un servidor HTTP simple desde la carpeta donde tengo el binario:

```bash
python3 -m http.server 8000
```

![WinPEAS enviado](images/winpeasx64-sended.png)
![winpeas recibido](images/shellwinpeas.png)

Ya en la víctima, lo ejecuto y guardo la salida en un archivo para revisarla con calma:

```powershell
peas.exe > peas.txt
```

![WinPEAS en víctima](images/winpeasEnvictima.png)

Después de revisar la salida, encuentro una referencia bastante clara:

```text
CVE-2019-1388
```

![CVE encontrada](images/CVEfinded.png)

Buscando información sobre esa CVE, confirmo que encaja con la máquina y con el binario que tengo delante.

![Info CVE](images/cve-info.png)

## Escalada de privilegios

En el escritorio veo un archivo llamado `hhupd`. Si lo ejecuto como administrador, puedo inspeccionar el certificado del publisher.

![Certificado](images/certificate.png)

Desde ese cuadro se puede abrir el enlace del publisher, lo que lanza Internet Explorer con la página correspondiente. Aquí viene la parte importante: si intento guardar la página con `Ctrl + S` o desde `File > Save as...`, aparece una ventana de guardado junto con un mensaje de error.

Le doy a `OK` en ese mensaje:

![Error](images/error.png)

Después, en la barra donde se escriben rutas, pongo `cmd` y pulso Enter. Eso me abre una consola con privilegios elevados.

![CMD](images/cmd.png)

Al comprobar el contexto, veo que ya estoy como `NT AUTHORITY\\SYSTEM`.

![SYSTEM](images/ntsystem.png)

## Resultado

La máquina cae por una combinación bastante directa: primero consigo acceso por RDP reutilizando la pista `Wade / Parzival`, y después escalo privilegios explotando `CVE-2019-1388` hasta llegar a `SYSTEM`.

## Resumen de comandos directo a SYSTEM/root

1. `nmap -sC -sV -p- -T4 --script vuln -Pn IP`
2. `gobuster dir -u http://IP -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt`
3. Identificar en `/retro` al usuario `Wade` y la pista `Parzival`
4. `remmina /u:Wade /p:parzival /v:IP`
5. `systeminfo`
6. `whoami /priv`
7. En Kali: `python3 -m http.server 8000`
8. En la víctima: descargar y ejecutar `winPEAS`, luego revisar la referencia a `CVE-2019-1388`
9. Ejecutar `hhupd.exe` como administrador
10. Abrir el certificado, seguir el enlace del publisher y pulsar `Ctrl + S`
11. Escribir `cmd` en la barra de la ventana de guardado
12. `whoami`
