#!/bin/bash

# Este script agrega todos los cambios, hace un commit y los sube al repositorio.
# Puedes pasar un mensaje de commit como parámetro, o usará uno por defecto.

MESSAGE=${1:-"Actualización del proyecto: integración con Mongo Atlas (después de clases)"}

echo "Agregando cambios..."
git add .

echo "Creando commit con el mensaje: '$MESSAGE'..."
git commit -m "$MESSAGE"

echo "Subiendo cambios al repositorio remoto..."
git push

echo "¡Completado!"
