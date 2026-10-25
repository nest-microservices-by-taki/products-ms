# Products Microservice

Microservicio de productos construido con [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/) y SQLite. No expone una API HTTP: se comunica por **TCP** y responde a mensajes (`@MessagePattern`) enviados por otro servicio, por ejemplo un API Gateway.

## Características

- CRUD de productos (`name`, `price`, `available`).
- Paginación en el listado de productos (`page`, `limit`).
- Borrado lógico: eliminar un producto lo marca como `available: false`.
- Validación de datos con `class-validator` (`whitelist` y `forbidNonWhitelisted`).

## Requisitos

- Node.js 22 o superior
- npm

## Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` en la raíz:

   ```env
   PORT=3001
   DATABASE_URL="file:./dev.db"
   ```

   | Variable       | Descripción                              |
   | -------------- | ---------------------------------------- |
   | `PORT`         | Puerto TCP en el que escucha el servicio |
   | `DATABASE_URL` | Ruta de la base de datos SQLite          |

3. Genera el cliente de Prisma y aplica las migraciones:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

   Vuelve a ejecutar `npx prisma generate` cada vez que cambies `prisma/schema.prisma`.

## Ejecución

```bash
# desarrollo (con recarga automática)
npm run start:dev

# producción
npm run build
npm run start:prod
```

## Mensajes disponibles

El servicio responde a estos patrones sobre TCP:

| Patrón                       | Payload                                       | Descripción                      |
| ---------------------------- | --------------------------------------------- | -------------------------------- |
| `{ cmd: 'create_product' }`  | `{ name, price }`                             | Crea un producto                 |
| `{ cmd: 'find_all_products' }` | `{ page?, limit? }` (por defecto `1` y `10`) | Lista productos paginados        |
| `{ cmd: 'find_one_product' }` | `id` (número)                                | Busca un producto por id         |
| `{ cmd: 'update_product' }`  | `{ id, ...campos }`                           | Actualiza un producto            |
| `{ cmd: 'delete_product' }`  | `id` (número)                                 | Marca un producto como no disponible |

La respuesta de `find_all_products` tiene esta forma:

```json
{
  "data": [],
  "metadata": { "page": 1, "total": 0, "lastPage": 0 }
}
```

### Ejemplo de cliente

Desde otro servicio NestJS:

```ts
ClientsModule.register([
  {
    name: 'PRODUCTS_SERVICE',
    transport: Transport.TCP,
    options: { host: 'localhost', port: 3001 },
  },
]);

this.client.send({ cmd: 'find_all_products' }, { page: 1, limit: 10 });
```

## Scripts

| Comando              | Descripción                      |
| -------------------- | -------------------------------- |
| `npm run start:dev`  | Inicia en modo desarrollo        |
| `npm run build`      | Compila a `dist/`                |
| `npm run start:prod` | Ejecuta la versión compilada     |
| `npm run lint`       | Ejecuta ESLint                   |
| `npm run test`       | Ejecuta las pruebas unitarias    |
| `npm run test:e2e`   | Ejecuta las pruebas e2e          |

## Estructura

```
prisma/        schema y migraciones
generated/     cliente de Prisma generado (no editar)
src/
  config/      variables de entorno
  common/      DTOs compartidos (paginación)
  products/    controlador, servicio y DTOs
  prisma.service.ts
  main.ts      arranque del microservicio TCP
```
