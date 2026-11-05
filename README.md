# Asistente Revisor de Residencias

Aplicación web pública con un backend Node.js que invoca el agente `Revisor-TSJ-Minimal` de Microsoft Foundry. La interfaz no contiene claves ni tokens.

## Ejecución local

Requiere Node.js 22 o superior. Instala las dependencias y configura el endpoint y el nombre del agente en el proceso del servidor:

```powershell
npm install
$env:FOUNDRY_PROJECT_ENDPOINT = "https://luis-primerai-resource.services.ai.azure.com/api/projects/luis-primerai"
$env:FOUNDRY_AGENT_NAME = "Revisor-TSJ-Minimal"
az login
npm start
```

Abre `http://localhost:3000`. En local, `DefaultAzureCredential` utiliza las credenciales de Azure disponibles en el equipo. La identidad debe tener el rol **Foundry Agent Consumer** en el proyecto de Foundry. No guardes claves en el código ni en el repositorio.

## Archivos de residencia

Se aceptan PDF y DOCX de hasta 20 MB. El servidor los procesa en memoria, extrae texto y lo envía al agente; no escribe los archivos ni crea vector stores. El texto enviado se limita a 80.000 caracteres. Los PDF escaneados requieren OCR antes de subirlos. El archivo seleccionado permanece en la memoria de la página y se vuelve a enviar mientras siga adjunto.

El documento se transmite a Microsoft Foundry para generar la respuesta. `store: false` solicita una respuesta sin guardar el objeto de conversación; esto no sustituye la política de tratamiento de datos del servicio de Azure ni garantiza que no existan registros operativos. No subas información personal o confidencial sin autorización institucional.

## Publicación en Azure

Publica el servidor y `index.html` juntos en Azure App Service con Node.js 22 o superior. Configura `FOUNDRY_PROJECT_ENDPOINT` y `FOUNDRY_AGENT_NAME` como configuración de aplicación y habilita la identidad administrada del App Service. Asigna a esa identidad **Foundry Agent Consumer** en el proyecto de Foundry. No habilites autenticación obligatoria del App Service si la web debe aceptar visitantes sin cuenta.

Una web anónima permite que cualquier persona invoque el agente y suba documentos. El backend limita las solicitudes a 10 por dirección IP cada 15 minutos, procesa como máximo tres solicitudes a la vez por instancia y limita cada archivo a 20 MB. El limitador incluido usa memoria local, por lo que no es un control de cuota distribuido ni suficiente por sí solo ante abuso a escala. Antes de anunciar la URL públicamente, configura protección de abuso y cuotas en la capa de publicación, revisa el coste esperado y acuerda la política institucional de documentos.

El despliegue no está incluido en el código: requiere seleccionar la región y confirmar los costes de los recursos de Azure. El equipo de desarrollo necesita además una sesión Azure autenticada para aprovisionar recursos.
