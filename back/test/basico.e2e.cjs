const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.status(200).send('OK'));

async function runBasicoTests() {
  console.log('Tests: Básico Github Actions');

  try {
    const res = await request(app).get('/');

    if (!res.status) {
      throw new Error('El servidor no ha respondido nada');
    }

    console.log('Test básico superado');
    console.log('Tests: Básico Github Actions OK\n');
    
    process.exit(0); 
  } catch (error) {
    console.error(error);
    process.exit(1); 
  }
}

runBasicoTests();