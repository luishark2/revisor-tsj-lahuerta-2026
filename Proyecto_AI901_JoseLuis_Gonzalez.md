# Asistente Inteligente para la Revisión de Informes de Residencia Profesional del TSJ La Huerta

**TECNOLÓGICO SUPERIOR DE JALISCO**  
**UNIDAD ACADÉMICA LA HUERTA**  
**PROYECTO INTEGRADOR AI-901**

**PRESENTA:** José Luis González Ortiz  
**CARRERA:** Ingeniería en Industrias Alimentarias  
**FECHA:** Noviembre 2026  

---

## 1. Descripción del Problema
Los estudiantes de las carreras de Ingeniería en Sistemas, Industrias Alimentarias, Licenciatura en Administración e Ingeniería en Administración del TSJ La Huerta presentan errores recurrentes en el formato APA 7 de sus informes de Residencia Profesional. La revisión manual por parte de los docentes gestores consume tiempo significativo y retrasa los procesos de titulación, generando una necesidad de retroalimentación inmediata y fundamentada.

## 2. Solución Propuesta
Se implementó un prototipo funcional en **Microsoft Foundry** utilizando una arquitectura RAG (Retrieval-Augmented Generation). El agente "Revisor-TSJ-Minimal" utiliza el *Manual de Estilo para Residencias Profesionales del TSJ* y el libro de *Metodología de la Investigación* de Bernal como base de conocimiento. El asistente analiza fragmentos de texto y devuelve retroalimentación estructurada citando la página exacta del manual.

**Link al Prototipo Funcional:**  
[PEGAR AQUÍ LA URL DE VISTA PREVIA DE LA WEB APP]

---

## 3. Evidencia del Funcionamiento

**Figura 1. Interfaz principal del asistente**  
*[INSERTAR AQUÍ LA CAPTURA DE LA FIGURA 1]*  
*Nota. Interfaz web del asistente desplegado en Microsoft Foundry, accesible para el estudiante.*

**Figura 2. Revisión de cita APA 7**  
*[INSERTAR AQUÍ LA CAPTURA DE LA PRUEBA DE BERNAL]*  
*Nota. El agente identifica el formato, cita las páginas 21-22 del Manual y sugiere la corrección exacta (Principio de Transparencia).*

**Figura 3. Manejo de fragmento insuficiente**  
*[INSERTAR AQUÍ LA CAPTURA DEL FRAGMENTO CORTO]*  
*Nota. Ante una entrada ambigua, el agente solicita más contexto en lugar de alucinar, citando la regla de párrafos mínimos de 5 líneas (Principio de Confiabilidad).*

**Figura 4. Protección de datos personales**  
*[INSERTAR AQUÍ LA CAPTURA DE LA CONSULTA DE PRIVACIDAD]*  
*Nota. El agente se niega a proporcionar información de terceros, protegiendo la confidencialidad (Principio de Privacidad y Seguridad).*

---

## 4. Cumplimiento de IA Responsable (Microsoft)

| Principio | Evidencia en el Prototipo |
| :--- | :--- |
| **Equidad** | Aplica las mismas reglas del Manual a las 4 carreras sin sesgo. |
| **Confiabilidad** | Rechaza evaluar fragmentos demasiado cortos, evitando alucinaciones. |
| **Privacidad** | Bloquea intentos de obtener datos personales de otros estudiantes. |
| **Inclusión** | Interfaz web accesible desde cualquier dispositivo (celular o PC). |
| **Transparencia** | Cada respuesta cita explícitamente la página del Manual utilizada. |
| **Rendición de cuentas** | Incluye la nota: "Esta revisión es orientativa. La validación final corresponde a tu asesor(a)". |

---

## 5. Conclusión
El prototipo demuestra que es posible transformar un documento estático (el Manual) en una herramienta interactiva de apoyo académico utilizando Azure AI Foundry, mejorando la eficiencia del proceso de revisión y la calidad de los informes entregados por los residentes.