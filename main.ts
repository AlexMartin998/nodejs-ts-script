/* eslint-disable indent */
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

// bun ./__ts__/main.ts --app_name="books" --model_name="Publisher"
// bun ./__ts__/main.ts --create_app --app_name="candies" --model_name="Candy"

const appName = argv.app_name as string;
const modelName = argv.model_name as string;
// optionals
const isNewApp = argv.create_app as boolean;
const onlyModel = argv.only_model as boolean;

const appUrl = `./src/${appName}`;

class MainCommand {
  start() {
    if (isNewApp) {
      this.createApp();
    }

    this.createModel();
    if (onlyModel) return;

    this.createDtos();
    this.createService();
    this.createController();
    this.createRoutes();
  }

  createApp() {
    const appUrl = `../src/${appName}`;
    const appPath = path.join(__dirname, appUrl);

    // create app directory
    if (!fs.existsSync(appPath)) {
      fs.mkdirSync(appPath, { recursive: true });
    }

    // create app files
    const appFiles = [
      'controllers',
      'dtos',
      'models',
      'routes',
      'services',
      'shared',
    ];

    appFiles.forEach(file => {
      const filePath = path.join(appPath, file);
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
    });

    console.log(`******* App created at ${appPath} *******`);
  }

  createModel() {
    const modelUrl = `${appUrl}/models/${modelName.toLocaleLowerCase()}.model.ts`;
    const modelContent = `import mongoose from 'mongoose';
    
const ${modelName.toLowerCase()}Schema = new mongoose.Schema(
  {
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ${modelName}Model = mongoose.model('${modelName}', ${modelName.toLowerCase()}Schema);`;

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(modelUrl)) {
      fs.writeFileSync(modelUrl, modelContent);
    }

    // create index file
    const indexModelUrl = `${appUrl}/models/index.ts`;
    const indexModelContent = `export * from './${modelName.toLocaleLowerCase()}.model';`;
    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(indexModelUrl)) {
      fs.writeFileSync(indexModelUrl, indexModelContent);
    }

    console.log(`******* Model created at ${modelUrl} *******`);
  }

  createDtos() {
    const dtosPath = `${appUrl}/dtos`;

    //* create dto -------------------
    const createDtoUrl = `${dtosPath}/create-${modelName.toLowerCase()}.dto.ts`;
    const createDtoContent = `import { z } from 'zod';

import { InvalidArgumentError, Nullable } from '@/shared/domain';
import { handleDtoValidation } from '@/shared/insfrastructure/utils';

export const Create${modelName}Schema = z.object({});


export class Create${modelName}Dto {
  private constructor(
  ) {}

  static create(props: Record<string, any>): Nullable<Create${modelName}Dto> {
    const validationResult = Create${modelName}Schema.safeParse(props);

    if (!validationResult.success) {
      const errors = handleDtoValidation(validationResult.error.issues);
      throw new InvalidArgumentError(errors);
    }

    const {  } = validationResult.data;
    return new Create${modelName}Dto();
  }
}`;

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(createDtoUrl)) {
      fs.writeFileSync(createDtoUrl, createDtoContent);
    }

    //* upd dto -------------------
    const updateDtoUrl = `${dtosPath}/update-${modelName.toLowerCase()}.dto.ts`;
    const updateDtoContent = `import { InvalidArgumentError, Nullable } from '@/shared/domain';
import { handleDtoValidation } from '@/shared/insfrastructure/utils';
import { Create${modelName}Schema } from './create-${modelName.toLowerCase()}.dto';

const Upd${modelName}Schema = Create${modelName}Schema.partial();

export class Upd${modelName}Dto {
  private constructor(
  ) {}

  static create(props: Record<string, any>): Nullable<Upd${modelName}Dto> {
    const validationResult = Upd${modelName}Schema.safeParse(props);

    if (!validationResult.success) {
      const errors = handleDtoValidation(validationResult.error.issues);
      throw new InvalidArgumentError(errors);
    }

    const {  } = validationResult.data;
    return new Upd${modelName}Dto();
  }
}`;

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(updateDtoUrl)) {
      fs.writeFileSync(updateDtoUrl, updateDtoContent);
    }

    ///* index dto -------------------
    const indexDtoUrl = `${dtosPath}/index.ts`;
    const indexDtoContent = `export * from './create-${modelName.toLowerCase()}.dto';
export * from './update-${modelName.toLowerCase()}.dto';`;

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(indexDtoUrl)) {
      fs.writeFileSync(indexDtoUrl, indexDtoContent);
    }

    console.log(`******* Dtos created at ${dtosPath} *******`);
  }

  createService() {
    ///* service interface -------------------
    const serviceUrl = `${appUrl}/services/${modelName.toLowerCase()}.service.ts`;
    const serviceContent = `import { Create${modelName}Dto, Upd${modelName}Dto } from '@/${appName}/dtos';

export interface ${modelName}Service {
  create(createDto: Create${modelName}Dto): Promise<void>;

  update(id: string, updDto: Upd${modelName}Dto): Promise<void>;

  findAll(): Promise<void>;

  findOne(id: string): Promise<void>;

  delete(id: string): Promise<void>;
}
`;
    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(serviceUrl)) {
      fs.writeFileSync(serviceUrl, serviceContent);
    }
    console.log(`******* Service Interface created at ${serviceUrl} *******`);

    ///* service implementation -------------------
    const serviceImplUrl = `${appUrl}/services/${modelName.toLowerCase()}.service.impl.ts`;
    const serviceImplContent = `import { Create${modelName}Dto, Upd${modelName}Dto } from '@/${appName}/dtos';
import { ${modelName}Service } from './${modelName.toLowerCase()}.service';
import { ${modelName}Model } from '../models';

export class ${modelName}ServiceImpl implements ${modelName}Service {

  constructor(private readonly ${modelName.toLowerCase()}Model: typeof ${modelName}Model) {}

  async create(createDto: Create${modelName}Dto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, updDto: Upd${modelName}Dto): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async findOne(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
`;
    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(serviceImplUrl)) {
      fs.writeFileSync(serviceImplUrl, serviceImplContent);
    }

    // index file
    const indexServiceUrl = `${appUrl}/services/index.ts`;
    const indexServiceContent = `export * from './${modelName.toLowerCase()}.service';
export * from './${modelName.toLowerCase()}.service.impl';`;
    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(indexServiceUrl)) {
      fs.writeFileSync(indexServiceUrl, indexServiceContent);
    }

    console.log(
      `******* Service Implementation created at ${serviceImplUrl} *******`
    );
  }

  createController() {
    const controllerUrl = `${appUrl}/controllers/${modelName.toLowerCase()}.controller.ts`;
    const controllerContent = `import { Request, Response } from 'express';

import { handleRestExceptions } from '@/shared/insfrastructure/server/utils';
import { Create${modelName}Dto, Upd${modelName}Dto } from '../dtos';
import { ${modelName}Service } from '../services';

export class ${modelName}Controller {
  constructor(private readonly ${modelName.toLowerCase()}Service: ${modelName}Service) {}

  async create(req: Request, res: Response) {
    try {
        const createDto = Create${modelName}Dto.create(req.body);
        const ${modelName.toLocaleLowerCase()} = await this.${modelName.toLowerCase()}Service.create(createDto!);
        return res.status(201).json(${modelName.toLocaleLowerCase()});
    } catch (error) {
        handleRestExceptions(error, res);
    }
  }

  async findAll(req: Request, res: Response) {
    try {
        const ${modelName.toLocaleLowerCase()}s = await this.${modelName.toLowerCase()}Service.findAll();
        return res.status(200).json(${modelName.toLocaleLowerCase()}s);
    }
    catch (error) {
        handleRestExceptions(error, res);
    }
  }

  async findOne(req: Request, res: Response) {
    try {
        const ${modelName.toLocaleLowerCase()} = await this.${modelName.toLowerCase()}Service.findOne(req.params.id);
        return res.status(200).json(${modelName.toLocaleLowerCase()});
    }
    catch (error) {
        handleRestExceptions(error, res);
    }
  }

  async update(req: Request, res: Response) {
    try {
        const updDto = Upd${modelName}Dto.create(req.body);
        const ${modelName.toLocaleLowerCase()} = await this.${modelName.toLowerCase()}Service.update(req.params.id, updDto!);
        return res.status(200).json(${modelName.toLocaleLowerCase()});
    }
    catch (error) {
        handleRestExceptions(error, res);
    }
  }

  async delete(req: Request, res: Response) {
    try {
        await this.${modelName.toLowerCase()}Service.delete(req.params.id);
        return res.status(204).send();
    }
    catch (error) {
        handleRestExceptions(error, res);
    }
  }
}
`;

    const directory = path.dirname(controllerUrl);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Ahora, escribe el archivo si no existe
    if (!fs.existsSync(controllerUrl)) {
      fs.writeFileSync(controllerUrl, controllerContent);
    }

    // create index file
    const indexControllerUrl = `${appUrl}/controllers/index.ts`;
    const indexControllerContent = `export * from './${modelName.toLowerCase()}.controller';`;
    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(indexControllerUrl)) {
      fs.writeFileSync(indexControllerUrl, indexControllerContent);
    }
  }

  createRoutes() {
    const routesUrl = `${appUrl}/routes/${modelName.toLowerCase()}.routes.ts`;
    const routesContent = `import { Router } from 'express';

import { diContainer } from '@/shared/insfrastructure/config';
import { ${modelName}Controller } from '../controllers';

export class ${modelName}Routes {
  static get routes(): Router {
    const router = Router();

    const ${modelName.toLocaleLowerCase()}Controller = diContainer.resolve<${modelName}Controller>('${modelName.toLocaleLowerCase()}Controller');

    router.post('/', (req, res) => ${modelName.toLocaleLowerCase()}Controller.create(req, res));
    router.get('/', (req, res) => ${modelName.toLocaleLowerCase()}Controller.findAll(req, res));
    router.get('/:id', (req, res) => ${modelName.toLocaleLowerCase()}Controller.findOne(req, res));
    router.put('/:id', (req, res) => ${modelName.toLocaleLowerCase()}Controller.update(req, res));
    router.delete('/:id', (req, res) => ${modelName.toLocaleLowerCase()}Controller.delete(req, res));

    return router;
  }
}`;

    const directory = path.dirname(routesUrl);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Ahora, escribe el archivo si no existe
    if (!fs.existsSync(routesUrl + '.ts')) {
      fs.writeFileSync(routesUrl + '.ts', routesContent);
    }

    console.log(`******* Routes created at ${routesUrl}.ts *******`);
  }

  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

const mainCommand = new MainCommand();
mainCommand.start();
