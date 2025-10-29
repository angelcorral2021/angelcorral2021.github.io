---
title: "Proyecto 1"
description: "Descripcion"
date: "2024-12-01"
status: "completed"
tags: ["htb", "privilege-escalation", "web", "grafana", "cve-2024-9264", "docker"]
---



# CRUD Básico con Servidor Web Apache y Base de Datos MySQL

## Descripción  
Este proyecto consiste en crear un servidor web con Apache conectado a una base de datos MySQL para desarrollar una aplicación web sencilla que implemente un CRUD (Create, Read, Update, Delete). El proyecto fue realizado en una máquina Ubuntu, principalmente usando la terminal.

## Pasos principales

### 1. Instalación de Apache, PHP y MySQL  
Actualizar paquetes e instalar con comandos:  
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install apache2 mysql-server php libapache2-mod-php php-mysql
```

### 2. Configuración de Apache  
Iniciar y habilitar el servicio Apache:  
```bash
sudo systemctl start apache2
sudo systemctl enable apache2
sudo systemctl status apache2
```
Verificar que Apache esté funcionando accediendo a [http://localhost].

### 3. Configuración de MySQL  
Ejecutar herramienta de seguridad para MySQL:  
```bash
sudo mysql_secure_installation
```
- Configurar plugin VALIDATE PASSWORD para reglas de complejidad.  
- Cambiar contraseña de usuario root a una segura.  
- Eliminar usuarios anónimos.  
- Restringir acceso remoto para root.  
- Eliminar base de datos test por defecto.  

Crear base de datos y usuario para la aplicación:  
```sql
CREATE DATABASE crud_db;
CREATE USER 'crud_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON crud_db.* TO 'crud_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Crear la estructura de la base de datos  
Ejemplo tabla users:  
```sql
USE crud_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Crear la aplicación web CRUD  
Carpeta recomendada: `/var/www/html/crud/` con estos archivos clave:  
- `db.php`: conexión a la base de datos  
- `index.php`: listar usuarios  
- `create.php`: crear usuario  
- `edit.php`: editar usuario  
- `delete.php`: eliminar usuario  

Ejemplo resumido de conexión en `db.php`:  
```php
<?php
$host = 'localhost';
$db = 'crud_db';
$user = 'crud_user';
$pass = 'password';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
```

### 6. Probar la aplicación  
Abrir navegador y acceder a:  
```
http://localhost/crud/index.php
```
Desde allí se podrá crear, leer, actualizar y eliminar usuarios.

### 7. Consideraciones de seguridad  
Este ejemplo es básico y no incluye validación de entradas ni protección contra SQL injection ni autenticación. Para entornos productivos es indispensable implementar estas medidas.

## Mejoras de diseño con Bootstrap  
Para un diseño más moderno, incluir en el `<head>` de los archivos PHP estas líneas:  
```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
<!-- Bootstrap Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />
```
Y antes de cerrar `</body>`:  
```html
<!-- Bootstrap JS y dependencias -->
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
```

## Resultado  
Con estas configuraciones y archivos, se dispone de un sencillo sistema de gestión de usuarios con interfaz web sobre Apache y base de datos MySQL, desplegado en Ubuntu.
