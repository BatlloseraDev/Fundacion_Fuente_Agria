const request = require('supertest');
const { describe, it } = require('./helpers/test-runner.cjs');
const kleur = require('kleur');

async function runBasicoTests(BASE_URL) {
  await describe(kleur.blue('Test: Básico Github Actions'), async () => {

    await it('GET /', async () => {

      const res = await request(BASE_URL).get('/');

      if (!res.status) {
        throw new Error(kleur.red('El servidor no ha respondido nada'));
      }

      console.log(kleur.green('Test básico superado'));
    });

  });

  console.log(kleur.blue('Test: Básico Github Actions OK\n'));
}

module.exports = { runBasicoTests };