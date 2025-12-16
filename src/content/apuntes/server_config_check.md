
```python 

#!/usr/bin/env python3
"""
server_config_check.py v1.3
Auditoría de configuraciones de seguridad en servidores Linux.
Solo lectura, sin modificar archivos.
Genera salida en consola y en server_config_audit.txt
"""

import os, re, time

report_lines = []

def log(msg):
    print(msg)
    report_lines.append(msg)

def analyze_file(path, checks):
    if not os.path.exists(path):
        log(f"[!] {path} no encontrado.")
        return

    log(f"\n[+] Analizando {path}")
    try:
        with open(path) as f:
            content = f.read()
    except Exception as e:
        log(f"[!] No se pudo leer {path}: {e}")
        return

    found = False
    for setting, pattern in checks.items():
        if re.search(pattern, content, re.IGNORECASE):
            log(f"[!] Riesgo: {setting}")
            found = True

    if not found:
        log("[✔] Ninguna configuración riesgosa detectada.")
    log("-" * 60)

def check_php_ini():
    checks = {
        "allow_url_include habilitado": r"allow_url_include\s*=\s*On",
        "allow_url_fopen habilitado (posible RFI)": r"allow_url_fopen\s*=\s*On",
        "display_errors habilitado (filtración de errores)": r"display_errors\s*=\s*On",
        "expose_php habilitado (divulga versión PHP)": r"expose_php\s*=\s*On",
        "register_globals habilitado (comportamiento obsoleto)": r"register_globals\s*=\s*On",
    }
    analyze_file("/etc/php.ini", checks)

def check_sshd_config():
    checks = {
        "PermitRootLogin habilitado (acceso root remoto)": r"^\s*PermitRootLogin\s+yes",
        "PasswordAuthentication habilitado (sin clave pública)": r"^\s*PasswordAuthentication\s+yes",
        "X11Forwarding habilitado (riesgo de túnel X)": r"^\s*X11Forwarding\s+yes",
        "AllowTcpForwarding habilitado": r"^\s*AllowTcpForwarding\s+yes",
    }
    analyze_file("/etc/ssh/sshd_config", checks)

def check_mysql_config():
    paths = ["/etc/my.cnf", "/etc/mysql/my.cnf", "/etc/mysql/mysql.conf.d/mysqld.cnf"]
    for path in paths:
        if os.path.exists(path):
            checks = {
                "MySQL escuchando en todas las interfaces (bind-address 0.0.0.0)": r"^\s*bind-address\s*=\s*0\.0\.0\.0",
                "skip-networking deshabilitado (MySQL accesible por red)": r"^\s*skip-networking\s*=\s*0",
                "secure_auth deshabilitado": r"^\s*secure_auth\s*=\s*0",
            }
            analyze_file(path, checks)
            return
    log("[!] No se encontró archivo de configuración MySQL.")
    log("-" * 60)

def save_report():
    filename = "server_config_audit.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write("Server Configuration Audit Report\n")
        f.write(f"Fecha: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 60 + "\n\n")
        f.write("\n".join(report_lines))
    print(f"\n[✔] Auditoría completada. Resultados guardados en {filename}")

def main():
    log("=== Server Configuration Check ===")
    check_php_ini()
    check_sshd_config()
    check_mysql_config()
    save_report()

if __name__ == "__main__":
    main()
```