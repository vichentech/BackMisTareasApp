#!/bin/bash

echo "================================================"
echo "  🚀 Inicialización de MisPartes Backend"
echo "================================================"
echo ""

if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado. Creando desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado."
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env y configura:"
    echo "   - MONGO_ROOT_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - ALLOWED_ORIGINS"
    echo ""
    read -p "Presiona Enter cuando hayas configurado el archivo .env..."
else
    echo "✅ Archivo .env encontrado."
fi

echo ""
echo "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado."
    echo "   Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi
echo "✅ Docker instalado: $(docker --version)"

echo ""
echo "🔍 Verificando Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi
echo "✅ Docker Compose instalado: $(docker compose version)"

echo ""
echo "🛑 Deteniendo contenedores existentes..."
docker compose down

echo ""
echo "🏗️  Construyendo imágenes..."
docker compose build

echo ""
echo "🚀 Iniciando servicios..."
docker compose up -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

echo ""
echo "🔍 Estado de los contenedores:"
docker compose ps

echo ""
echo "📋 Logs del backend:"
docker compose logs backend --tail=20

echo ""
echo "================================================"
echo "  ✅ Inicialización completada"
echo "================================================"
echo ""
echo "📍 El backend está disponible en:"
echo "   http://localhost:3000"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs:           docker compose logs -f"
echo "   Detener:            docker compose stop"
echo "   Reiniciar:          docker compose restart"
echo "   Eliminar todo:      docker compose down -v"
echo ""
echo "📖 Para más información, consulta DEPLOYMENT_GUIDE.md"
echo ""

read -p "¿Deseas crear el usuario administrador ahora? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo ""
    echo "🔐 Creando usuario administrador..."
    echo ""
    read -p "Username [admin]: " username
    username=${username:-admin}
    
    read -sp "Password [admin123]: " password
    echo ""
    password=${password:-admin123}
    
    read -p "Email [admin@example.com]: " email
    email=${email:-admin@example.com}
    
    echo ""
    echo "Creando usuario..."
    
    curl -X POST http://localhost:3000/setup/create-admin \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"$username\",\"password\":\"$password\",\"email\":\"$email\"}" \
      2>/dev/null
    
    echo ""
    echo ""
    echo "✅ Usuario administrador creado."
    echo ""
    echo "🔑 Credenciales:"
    echo "   Username: $username"
    echo "   Password: $password"
    echo ""
fi

echo "🎉 ¡Todo listo! Puedes empezar a usar la aplicación."
