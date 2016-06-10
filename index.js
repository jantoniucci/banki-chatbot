'use strict';

const JSONPath = require('JSONPath');
const Wit = require('node-wit').Wit;
const dateFormat = require('dateformat');
const Logger = require('node-wit').Logger;
const levels = require('node-wit').logLevels;
const logger = new Logger(levels.ERROR);
const token = (() => { return "TDV7T53HRY6QBED6UUR7VO3AV2Y6NPEW"; })();

const addFirstEntityValueToContext = (context, entities, pathAtEntity, nameAtContext) => {
  const val = JSONPath({path: pathAtEntity, json: entities});
  if (!val) {
    return;
  }
  context[nameAtContext] = val;
};

const firstContextValue = (context, entity) => {
  const val = context && context[entity];
  if (!val) {
    return null;
  }
  return val;
};

const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    // console.log('*** entities = ' + JSON.stringify(entities)); 
    if (context.datetime) {
      addFirstEntityValueToContext(context, entities, '$.datetime[0].value', 'fecha');
      addFirstEntityValueToContext(context, entities, '$.datetime[0].from.value', 'fechaDesde');
      addFirstEntityValueToContext(context, entities, '$.datetime[0].to.value', 'fechaHasta');
    };
    cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
  ['obtenerSaldo'](sessionId, context, cb) {
    const fecha = firstContextValue(context, 'fecha');
    if (fecha) {
      context.mensajeSaldo = 'Tu saldo era de 423 euros en tu cuenta y 3,817 euros sumando tu cuenta y depósito a fecha ' + dateFormat(fecha, "d mmmm");
    } else{
      context.mensajeSaldo = 'Tienes 1,623 euros en tu cuenta y 4,217 euros sumando tu cuenta y depósito.';
    };
    cb(context);
  },
  ['obtenerSaldoCuentas'](sessionId, context, cb) {
    context.mensajeSaldoCuentas = 'Tienes 1,623 euros en tu cuenta [Mi cuenta].';
    cb(context);
  },
  ['obtenerSaldoDepositos'](sessionId, context, cb) {
    context.mensajeSaldoDepositos = 'Tienes 2,594 euros en tu depósito [Mis ahorros Plus].';
    cb(context);
  },
  ['obtenerContratos'](sessionId, context, cb) {
    context.mensajeSaldo = 'Tienes una cuenta [Mi cuenta] y un depósito [Mis ahorros Plus].';
    cb(context);
  },
  ['obtenerSaludo'](sessionId, context, cb) {
    context.mensajeSaludo = 'Hola, soy Benki, tu asistente bancario. Respondo a preguntas como: cuál es mi saldo? qué productos tengo? cuál era mi saldo la semana pasada? etc';
    cb(context);
  },
  ['obtenerGastos'](sessionId, context, cb) {
    if (!context.fechaDesde || !context.fechaHasta || !context.fecha) {
      context.mensajeSaldo = 'No comprendo las fechas indicadas. Inténtalo de otra forma.';  
    };
    if ( Array.isArray(context.fecha) 
      && context.fecha.length > 0 
      && context.fecha[0].length > 0 ) {
      context.mensajeSaldo = 'Has gastado 213 euros el ' + dateFormat(context.fecha, "d mmmm");
    } else{
      context.mensajeSaldo = 'Has gastado 213 euros entre el ' + dateFormat(context.fechaDesde, "d mmmm") + ' y el ' + dateFormat(context.fechaHasta, "d mmmm");
    };
    cb(context);
  }
};

const client = new Wit(token, actions, logger);
client.interactive();
