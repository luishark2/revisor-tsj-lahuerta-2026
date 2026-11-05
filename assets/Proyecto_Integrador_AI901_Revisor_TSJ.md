# Fundamentos de Inteligencia Artificial
## Uso de herramientas de Microsoft para la transformación digital

**Proyecto:** "Implementación de un Asistente Inteligente para la Revisión de Informes de Residencia Profesional en el TSJ La Huerta"  
**Participante:** José Luis González Ortiz  
**Documento:** Proyecto de Transformación Digital en TSJ La Huerta  
**Fecha:** 06 de Noviembre de 2026  
**Contexto:** Proyecto integrador para la certificación AI-901: Microsoft Azure AI Fundamentals  

---

## Tabla de contenido
1. Antecedentes y contexto del problema  
2. Objetivo del Proyecto  
3. Herramientas y arquitectura  
4. Alcance real del componente inteligente  
5. Funcionalidades y resultados visibles  
6. Manual básico de usuario  
7. Desarrollo, control de versiones y despliegue  
8. Problemas encontrados y solución  
9. Limitaciones y siguientes mejoras  
10. Conclusión  
Enlaces finales  

---

## 1. Antecedentes y contexto del problema
En el Tecnológico Superior de Jalisco, Unidad Académica La Huerta (TSJ La Huerta), los estudiantes de las carreras de Ingeniería en Sistemas Computacionales, Ingeniería en Industrias Alimentarias, Licenciatura en Administración e Ingeniería en Administración deben entregar un Informe Técnico de Residencia Profesional. 

El problema identificado es que los estudiantes presentan errores recurrentes en el formato APA 7ma edición (citas textuales, parafraseo, redacción en tercera persona, párrafos menores a 5 líneas, verbos en objetivos). La revisión manual de estos fragmentos por parte del docente gestor consume horas significativas, genera cuellos de botella en los procesos de titulación y no ofrece retroalimentación inmediata al estudiante, quien a menudo trabaja en modalidad mixta y requiere orientación flexible.

## 2. Objetivo del Proyecto
Desarrollar y publicar una aplicación web con un asistente de Inteligencia Artificial Generativa que permita a los estudiantes enviar fragmentos de sus informes y recibir retroalimentación estructurada e inmediata, verificando el cumplimiento de las reglas establecidas en el "Manual de Estilo para Residencias Profesionales del TSJ" y el libro de "Metodología de la Investigación" de Bernal.

## 3. Herramientas y arquitectura
| Componente | Implementación |
| :--- | :--- |
| **Interfaz de usuario** | Aplicación Web nativa de Azure (HTML/CSS/JS generado por Azure AI Studio). |
| **Plataforma de IA** | Microsoft Azure AI Foundry (anteriormente Azure AI Studio). |
| **Modelo de Lenguaje** | Azure OpenAI Service (Modelo `gpt-4o-mini` por su eficiencia y bajo costo). |
| **Base de Conocimiento** | Arquitectura RAG (Retrieval-Augmented Generation) utilizando Azure AI Search con los documentos PDF oficiales del TSJ cargados directamente. |
| **Identidad del Agente** | `Revisor-TSJ-Minimal-AgentIdentity` |
| **Alojamiento** | Azure App Service (Plan gratuito para estudiantes, región West US). |

**Flujo:** 
![Flujo](assets/Flujo.png)

## 4. Alcance real del componente inteligente
El asistente no califica ni reescribe el informe completo automáticamente. Su alcance real es actuar como un **tutor de formato**. Utiliza una arquitectura RAG para buscar reglas específicas en los manuales cargados y compararlas con el fragmento que el usuario proporciona. La lógica de respuesta está gobernada por un *System Prompt* estricto que le obliga a citar la página exacta del manual, rechazar fragmentos demasiado cortos y proteger la privacidad de los datos, evitando alucinaciones.

## 5. Funcionalidades y resultados visibles
En la aplicación publicada, el usuario puede interactuar mediante un chat y obtener respuestas que demuestran los 6 principios de IA Responsable de Microsoft:

**Ilustración 1. Interfaz principal de la aplicación web publicada**
![Interfaz de la aplicación web](assets/figura1-interfaz-app.png)

*Nota.* Pantalla de inicio del asistente Revisor-TSJ accesible desde la URL pública 
https://revisor-tsj-lahuerta-2026-g0d9htbhhcbnbzh9.westus-01.azurewebsites.net/. 
El estudiante puede iniciar la revisión inmediatamente sin necesidad de login.

1. **Transparencia:** Al revisar una cita, el agente responde: *"Cumple: Uso correcto de apellido... Manual p. 21-22"*.
**Ilustración 2. Revisión de cita APA 7 con citación de página del Manual**

![Revisión de cita Bernal](assets/figura2-revision-cita.png)

*Nota.* El asistente revisa la cita "(Bernal, 2006, p.55)" y responde citando 
las páginas 21-22 del Manual de Estilo del TSJ. Demuestra el principio de 
**Transparencia**.

2. **Confiabilidad:** Si el usuario escribe *"El proyecto es importante"*, el agente responde: *"Necesito más contexto, comparte al menos un párrafo completo"* (evitando inventar una corrección).
**Ilustración 3. Rechazo de evaluación por fragmento insuficiente**

![Fragmento corto](assets/figura3-fragmento-corto.png)

*Nota.* Ante el texto "El proyecto es importante.", el asistente aplica el principio 
de **Confiabilidad y Seguridad**: rechaza evaluar algo ambiguo.

3. **Privacidad:** Si se pregunta *"¿Cuánto sacó Juan Pérez?"*, el agente se niega a responder, protegiendo datos sensibles.
**Ilustración 4. Protección de información personal de estudiantes**

![Privacidad de datos](assets/figura4-privacidad.png)

*Nota.* Cuando se pregunta por la calificación de "Juan Pérez", el asistente 
aplica el principio de **Privacidad y Seguridad**.


4. **Rendición de cuentas:** Todas las respuestas incluyen la nota: *"Esta revisión es orientativa. La validación final corresponde a tu asesor(a)"*.

## 6. Manual básico de usuario
1. **Acceso:** Abrir la URL pública desde cualquier navegador (PC o celular).
2. **Interacción:** En el cuadro de chat, pegar el fragmento del informe que se desea revisar o hacer una pregunta específica sobre el formato.
   - *Ejemplo válido:* "Revisa si esta cita está bien formada: (Bernal, 2006, p.55)"
   - *Ejemplo válido:* "¿Qué verbos se recomiendan para el objetivo general según el manual?"
3. **Revisión:** Leer la respuesta estructurada del asistente, prestando atención a las páginas del manual que cita como referencia.
4. **Corrección:** Aplicar las sugerencias en el documento de Word propio y volver a consultar si es necesario.

## 7. Desarrollo, control de versiones y despliegue
El prototipo se diseñó y configuró directamente en **Microsoft Azure AI Foundry**. 
1. Se creó el agente `Revisor-TSJ-Minimal-AgentIdentity`.
2. Se cargaron los archivos PDF oficiales (Manual TSJ y Bernal) utilizando la herramienta nativa de "Cargar archivos" para garantizar la indexación semántica correcta.
3. Se redactó y ajustó el *System Prompt* para definir el tono, el formato de salida y las reglas de IA Responsable.
4. El código y la configuración del proyecto se versionan y almacenan en un repositorio de GitHub para garantizar la trazabilidad.
5. Para el despliegue, se utilizó la función nativa de Foundry "Publicar como aplicación web", vinculándola a la suscripción *Azure for Students* en la región *West US*, lo que generó la URL pública final sin necesidad de configurar servidores Node.js o contenedores manualmente.
**Ilustración 5. Configuración del agente en Microsoft Azure AI Foundry**

![Agente en Foundry](assets/figura5-foundry.png)

*Nota.* Pantalla de configuración del agente `Revisor-TSJ-Minimal-AgentIdentity` 
en Azure AI Foundry.

**Ilustración 6. Repositorio de código en GitHub**

![Repositorio GitHub](assets/figura6-github.png)

*Nota.* Repositorio https://github.com/luishark2/revisor-tsj-lahuerta-2026 con el 
código de la aplicación web y documentación.

## 8. Problemas encontrados y solución
**Problema:** Durante la fase de configuración, se intentó conectar un índice de Azure AI Search creado manualmente desde el portal de Azure, lo que generó errores de autenticación (HTTP 401 Unauthorized) y de solicitud incorrecta (HTTP 400 Bad Request) debido a discrepancias en las credenciales y la falta de configuración semántica.  
**Solución:** Se optó por la ruta nativa de Microsoft Foundry: utilizar la opción "Cargar archivos" directamente en la configuración del agente. Esto permitió que la plataforma gestionara automáticamente la creación del índice vectorial, la configuración semántica y la conexión segura, resolviendo los errores de inmediato y simplificando la arquitectura.

## 9. Limitaciones y siguientes mejoras
- **Limitación actual:** El prototipo está diseñado para revisar fragmentos de texto pegados en el chat. No procesa archivos Word completos de 50 páginas en una sola solicitud debido a los límites de tokens de la versión de prueba.
- **Persistencia:** Al ser un despliegue de evaluación, no guarda un historial de conversaciones por usuario (por diseño, para proteger la privacidad).
- **Siguientes mejoras:** Integrar Azure AI Document Intelligence para que el estudiante pueda subir el PDF completo y el sistema genere un reporte de correcciones página por página. Vincular la aplicación con Microsoft Entra ID para que solo estudiantes con correo institucional puedan acceder.

## 10. Conclusión
Este proyecto permitió transformar una propuesta teórica de apoyo académico en una aplicación web funcional y desplegada en la nube. Se demostró que es posible utilizar Microsoft Foundry y una arquitectura RAG para resolver un problema real de gestión educativa en el TSJ La Huerta, reduciendo la carga de revisión manual y empoderando a los estudiantes con retroalimentación inmediata, todo bajo un estricto marco de IA Responsable.

---

## Enlaces finales
- **Aplicación Web Pública (Prototipo Funcional):**  
  [https://revisor-tsj-lahuerta-2026-g0d9htbhhcbnbzh9.westus-01.azurewebsites.net/](https://revisor-tsj-lahuerta-2026-g0d9htbhhcbnbzh9.westus-01.azurewebsites.net/)
- **Repositorio de Código:**  
  [https://github.com/luishark2/revisor-tsj-lahuerta-2026](https://github.com/luishark2/revisor-tsj-lahuerta-2026)
- **Agente configurado:** `Revisor-TSJ-Minimal-AgentIdentity` en Microsoft Azure AI Foundry.
- **Base documental:** "Manual de Estilo para Residencias Profesionales", TSJ La Huerta (2024) y Bernal, C. A. (2006). *Metodología de la investigación*.