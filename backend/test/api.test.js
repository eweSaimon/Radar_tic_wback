// Pruebas automáticas de los endpoints (node:test + fetch nativo, sin dependencias extra)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { crearApp } = require('../src/app');

let server;
let base;

before(async () => {
  server = crearApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

const post = (body, raw = false) =>
  fetch(`${base}/api/intereses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ? body : JSON.stringify(body),
  });

test('GET /api/oportunidades retorna correctamente la colección', async () => {
  const res = await fetch(`${base}/api/oportunidades`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data) && data.length > 0);
  assert.ok(data[0].id && data[0].titulo);
});

test('GET /api/oportunidades/:id retorna una oportunidad válida', async () => {
  const res = await fetch(`${base}/api/oportunidades/3`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).id, 3);
});

test('GET /api/oportunidades/:id inexistente responde 404', async () => {
  const res = await fetch(`${base}/api/oportunidades/999`);
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});

test('POST /api/intereses con datos correctos es aceptado (201)', async () => {
  const res = await post({ nombre: 'Laura Gómez', correo: 'laura@email.com', oportunidadId: 3 });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.interes.oportunidadId, 3);
  assert.ok(data.mensaje);
});

test('POST con campos faltantes es rechazado (400)', async () => {
  const res = await post({ nombre: 'Laura Gómez' });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.deepEqual(data.camposFaltantes, ['correo', 'oportunidadId']);
});

test('POST con correo de formato inválido es rechazado (400)', async () => {
  const res = await post({ nombre: 'Laura', correo: 'no-es-correo', oportunidadId: 3 });
  assert.equal(res.status, 400);
});

test('POST con JSON mal formado es rechazado (400)', async () => {
  const res = await post('{ esto no es json', true);
  assert.equal(res.status, 400);
});

test('POST con oportunidad inexistente es rechazado (404)', async () => {
  const res = await post({ nombre: 'Laura', correo: 'laura@email.com', oportunidadId: 999 });
  assert.equal(res.status, 404);
});

test('POST sobre una oportunidad no disponible es rechazado (409)', async () => {
  const res = await post({ nombre: 'Laura', correo: 'laura@email.com', oportunidadId: 4 });
  assert.equal(res.status, 409);
  assert.match((await res.json()).error, /no se encuentra disponible/);
});

test('GET con identificadores no enteros (0x3, 3.0, abc) responde 404', async () => {
  for (const id of ['0x3', '3.0', 'abc', '-1', '1e0']) {
    const res = await fetch(`${base}/api/oportunidades/${id}`);
    assert.equal(res.status, 404, `id "${id}" debería dar 404`);
  }
});

test('POST con oportunidadId de tipo inválido (true, [3], "3abc") es rechazado (400)', async () => {
  for (const oportunidadId of [true, [3], '3abc', 3.5, {}]) {
    const res = await post({ nombre: 'Laura', correo: 'laura@email.com', oportunidadId });
    assert.equal(res.status, 400, `oportunidadId ${JSON.stringify(oportunidadId)} debería dar 400`);
  }
});

test('POST acepta oportunidadId numérico enviado como texto ("3")', async () => {
  const res = await post({ nombre: 'Laura', correo: 'laura@email.com', oportunidadId: '3' });
  assert.equal(res.status, 201);
});

test('POST con nombre o correo demasiado largos es rechazado (400)', async () => {
  const largo = await post({ nombre: 'x'.repeat(101), correo: 'laura@email.com', oportunidadId: 3 });
  assert.equal(largo.status, 400);
  const correo = await post({ nombre: 'Laura', correo: 'a'.repeat(250) + '@b.co', oportunidadId: 3 });
  assert.equal(correo.status, 400);
});

test('POST con nombre/correo que no son texto es rechazado (400)', async () => {
  const res = await post({ nombre: 123, correo: ['a@b.co'], oportunidadId: 3 });
  assert.equal(res.status, 400);
});

test('Ruta inexistente responde 404 en JSON', async () => {
  const res = await fetch(`${base}/api/no-existe`);
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});

test('CORS permite el origen de Angular (http://localhost:4200)', async () => {
  const res = await fetch(`${base}/api/oportunidades`, {
    headers: { Origin: 'http://localhost:4200' },
  });
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:4200');
});
