import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

// Utiliza import.meta.env para acceder a las variables de entorno en Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY no está definida en el archivo .env");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });

export interface FinancialSummaryForAI {
    passiveIncome: number;
    activeIncome: number;
    totalExpenses: number;
    netWorth: number;
    cashFlow: number;
    freedomPercentage: number;
    venturesCount: number;
}

export async function getFinancialInsight(summary: FinancialSummaryForAI): Promise<string> {
    const prompt = `
    Eres un coach financiero de élite para emprendedores, basado en los principios de Robert Kiyosaki, Naval Ravikant y Peter Lynch.
    Tu misión es entregar un "Briefing Estratégico" accionable para ayudar al usuario a construir riqueza y alcanzar la libertad financiera.
    Analiza este estado financiero y responde OBLIGATORIAMENTE con un JSON que contenga 4 claves: "diagnosis", "alert", "opportunity", y "mission".
    Sé directo, conciso y profesional, como un verdadero CEO. El idioma de la respuesta debe ser español.

    Estado Financiero Actual:
    - Ingreso Pasivo Mensual: S/ ${summary.passiveIncome.toFixed(2)}
    - Ingreso Activo Mensual: S/ ${summary.activeIncome.toFixed(2)}
    - Gastos Totales Mensuales: S/ ${summary.totalExpenses.toFixed(2)}
    - Flujo de Caja Mensual (Cash Flow): S/ ${summary.cashFlow.toFixed(2)}
    - Patrimonio Neto: S/ ${summary.netWorth.toFixed(2)}
    - % de Libertad Financiera: ${summary.freedomPercentage.toFixed(1)}%
    - Ventures (Proyectos de Inversión) activos: ${summary.venturesCount}

    Ejemplo de formato de respuesta deseado (debe ser un JSON válido SIN saltos de línea ni comentarios):
    {"diagnosis": "Fase de Acumulación de Capital. Tu flujo de caja es positivo, pero la dependencia del ingreso activo es alta.","alert": "El 85% de tus ingresos provienen de una sola fuente activa. Diversificar es tu principal seguro contra la fragilidad financiera.","opportunity": "Tu pasivo más pequeño (Préstamo X) puede ser eliminado en 3 meses con tu flujo de caja actual. Esto liberaría S/ 150 mensuales.","mission": "Esta semana, investiga y modela un nuevo 'Venture' que requiera menos de S/ 2000 de capital inicial."}

    Ahora, genera el "Briefing Estratégico" en formato JSON para el estado financiero actual.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error calling Gemini API for insight:", error);
        return JSON.stringify({
            diagnosis: "Error de Conexión",
            alert: "No se pudo conectar con el Asesor IA.",
            opportunity: "Verifica tu clave de API y la conexión a internet.",
            mission: "Inténtalo de nuevo más tarde."
        });
    }
}


export async function parseTransaction(
    prompt: string,
    categories: Category[]
): Promise<{ amount: number; description: string; type: 'Ingreso' | 'Egreso', categoryId: string | null }> {
    const categoryNames = categories.map(c => c.name);

    const schema = {
        type: Type.OBJECT,
        properties: {
            amount: {
                type: Type.NUMBER,
                description: "El monto de la transacción. Debe ser un número positivo.",
            },
            description: {
                type: Type.STRING,
                description: "Una breve descripción de la transacción.",
            },
            type: {
                type: Type.STRING,
                description: "El tipo de transacción, ya sea 'Ingreso' o 'Egreso'.",
                enum: ["Ingreso", "Egreso"],
            },
            categoryName: {
                type: Type.STRING,
                description: `El nombre de la categoría que mejor se ajusta a la transacción. Elige una de las siguientes: ${categoryNames.join(", ")}.`,
                enum: categoryNames,
            },
        },
        required: ["amount", "description", "type", "categoryName"],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analiza la siguiente transacción y extrae la información en formato JSON. Texto de la transacción: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);
        
        const matchedCategory = categories.find(c => c.name === parsedJson.categoryName);

        return {
            amount: parsedJson.amount,
            description: parsedJson.description,
            type: parsedJson.type,
            categoryId: matchedCategory ? matchedCategory.id : null
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("No se pudo procesar la transacción con la IA.");
    }
}
