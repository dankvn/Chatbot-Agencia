import "dotenv/config";
import bot from "@bot-whatsapp/bot";
import { getDay } from "date-fns";
import QRPortalWeb from "@bot-whatsapp/portal";
import BaileysProvider from "@bot-whatsapp/provider/baileys";
import MockAdapter from "@bot-whatsapp/database/mock";

import chatgpt from "./services/openai/chatgpt.js";
import GoogleSheetService from "./services/sheets/index.js";

const googelSheet = new GoogleSheetService(
  "1YickVZ-xgeqKK88pZo9g2wOt40Rd0UOYlIGFEL_pWBE"
);

const GLOBAL_STATE = [];

const flowEmpty = bot
  .addKeyword(bot.EVENTS.ACTION)
  .addAnswer("No te he entendido!", null, async (_, { gotoFlow }) => {
    return gotoFlow(flowPrincipal);
  });

const flowPedido = bot
  .addKeyword(["2","agente"], { sensitive: true })
  .addAnswer(
    "¿Cual es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ name: ctx.body });
    }
  )
  .addAnswer(
    "¿Ingrese una descripcion de como quiere implementar su chatbot en su negocio ?",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ descripcion: ctx.body });
    }
  )
  .addAnswer(
    "Perfecto nuestro *Agente* esta analizando toda la informacion proporcionada",
    null,
    async (ctx, { state }) => {
      const currentState = state.getMyState();
      await googelSheet.saveOrder({
        fecha: new Date().toDateString(),
        telefono: ctx.from,
        nombre: currentState.name,
        descripcion: currentState.descripcion,
      });
    }
  );

const flowInf = bot
  .addKeyword(["informacion", "información", "documentación"])
  .addAnswer("¡Impulsa tu Negocio con Chatbots Inteligentes en WhatsApp!", {
    media: "https://i.imgur.com/KSgiC2B.png",
    delay: 1000,
  })

  .addAnswer(
    [
      "Aquí encontra toda la informacion sobre nuestro servicio ",
      "\n*2️⃣* Para contactar con un Acessor.",
      "\n↩️ *Regresar* ",
    ],
    
  );



const flowContactar = bot
  .addKeyword(["Contactar", "contactar"])
  .addAnswer(
    "¿Cual es tu nombre?",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ name: ctx.body });
    }
  )
  .addAnswer(
    "¿Alguna descripcion?",
    { capture: true },
    async (ctx, { state }) => {
      state.update({ descripcion: ctx.body });
    }
  )
  .addAnswer(
    "Perfecto nuestro *Agente* esta analizando toda la informacion proporcionada",
    null,
    async (ctx, { state }) => {
      const currentState = state.getMyState();
      await googelSheet.saveOrder({
        fecha: new Date().toDateString(),
        telefono: ctx.from,
        pedido: currentState.pedido,
        nombre: currentState.name,
        descripcion: currentState.descripcion,
      });
    }
  );


const flowDiscord = bot
  .addKeyword(["preguntas"])
  .addAnswer(
    [
      "📋❓",
      "\n*1️⃣*¿Qué es un chatbot?\n \nUn chatbot es un programa de inteligencia artificial diseñado para interactuar con los usuarios a través de conversaciones de chat. Puede responder preguntas, brindar información, realizar tareas específicas y proporcionar asistencia automatizada.\n",
      "\n*2️⃣*¿Cómo funcionan los chatbots?\n \nLos chatbots funcionan a través de algoritmos de procesamiento de lenguaje natural (NLP) que les permiten comprender y responder a las preguntas de los usuarios. Utilizan una base de conocimiento y reglas predefinidas para generar respuestas.\n",
      "\n*3️⃣*¿ ¿Cuáles son los beneficios de utilizar chatbots?\n \n*Disponibilidad 24/7*: Los chatbots pueden estar disponibles para los usuarios en cualquier momento, lo que mejora la atención al cliente.\n \n*Eficiencia*: Automatizan tareas repetitivas, lo que ahorra tiempo y recursos.\n  \n*Respuestas instantáneas*: Proporcionan respuestas rápidas y precisas a las preguntas de los usuarios.\n",
      "\n*4️⃣*¿En qué industrias se utilizan los chatbots?\n \nLos chatbots se utilizan en una amplia gama de industrias, incluyendo atención al cliente, ventas, servicios financieros, salud, viajes, educación y más. Son versátiles y pueden adaptarse a diversas necesidades empresariales.\n",
      "\n*5️⃣*¿Cómo se implementa un chatbot en mi negocio?\n \nLa implementación de un chatbot generalmente implica los siguientes pasos:\n \nDefinir los objetivos y casos de uso.\n \nSeleccionar una plataforma o desarrollar uno personalizado.\n \nDiseñar el flujo de conversación y entrenar al chatbot.\n \nIntegrar el chatbot con tus sistemas y plataformas existentes.\n \nProbar y ajustar el chatbot según la retroalimentación de los usuarios.\n",
      "\n*↩️**Regresar*"



    ],
    
  );
const flowPrincipal = bot
  .addKeyword(["hola", "hi"])
  .addAnswer("Hola bienvenido a *DevMaster*")
  .addAnswer('*"Agencia de Chatbots"* 🤖')
  .addAnswer(
    [
      "Por favor, selecciona una opción:",
      "📃 *Información* sobre el servicio",
      "👨‍💻 *Contactar* a nuestro equipo",
      "❓ *Preguntas* frecuentes",
    ],
    null,
    null,
    [flowInf, flowContactar, flowDiscord, flowPedido, flowEmpty],
    
    
  );
  const flowRegresar = bot
  .addKeyword("regresar")
  .addAnswer("Volviendo al menú principal...", null, async (_, { gotoFlow }) => {
    return gotoFlow(flowPrincipal);
  });


const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = bot.createFlow([
    flowPrincipal,
    flowPedido,
    flowEmpty,
    flowRegresar
    
  ]);
  const adapterProvider = bot.createProvider(BaileysProvider);

  bot.createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
