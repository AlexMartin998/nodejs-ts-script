/* eslint-disable indent */
import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  genControllerCode,
  genControllerIndexCode,
  genCreateDtoCode,
  genIndexDtoCode,
  genIndexService,
  genModelCode,
  genRoutesCode,
  genRoutesIndexCode,
  genServiceImplCode,
  genServiceInterfaceCode,
  genUpdDtoCode,
  handleDIContainerCode,
} from './gen-code';

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
      const res = this.createApp();
      if (res === null) return;
    }

    this.createModel();
    if (onlyModel) return;

    this.createDtos();
    this.createService();
    this.createController();
    this.createRoutes();

    // upd common files --------
    this.updateDIContainer();
    // this.updateServerRoutes();
  }

  createApp() {
    const appUrl = `../src/${appName}`;
    const appPath = path.join(__dirname, appUrl);

    // create app directory
    const appAlreadyExists = fs.existsSync(appPath);
    if (appAlreadyExists) {
      console.log(`App ${appName} already exists at ${appPath}`);
      return null;
    }

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
    const modelContent = genModelCode({ modelName });

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(modelUrl)) {
      fs.writeFileSync(modelUrl, modelContent);
    }

    // create index file -------------------
    const indexModelUrl = `${appUrl}/models/index.ts`;
    const indexModelContent = `export * from './${modelName.toLocaleLowerCase()}.model';`;
    // write file if not exists, otherwise add new imports at the end
    if (!fs.existsSync(indexModelUrl)) {
      fs.writeFileSync(indexModelUrl, indexModelContent);
    } else {
      const data = fs.readFileSync(indexModelUrl, 'utf-8');
      if (
        !data.includes(
          `export * from './${modelName.toLocaleLowerCase()}.model';`
        )
      ) {
        fs.appendFileSync(
          indexModelUrl,
          `\nexport * from './${modelName.toLocaleLowerCase()}.model';\n`
        );
      }
    }

    console.log(`******* Model created at ${modelUrl} *******`);
  }

  createDtos() {
    const dtosPath = `${appUrl}/dtos`;

    //* create dto -------------------
    const createDtoUrl = `${dtosPath}/create-${modelName.toLowerCase()}.dto.ts`;
    const createDtoContent = genCreateDtoCode({ modelName });

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(createDtoUrl)) {
      fs.writeFileSync(createDtoUrl, createDtoContent);
    }

    //* upd dto -------------------
    const updateDtoUrl = `${dtosPath}/update-${modelName.toLowerCase()}.dto.ts`;
    const updateDtoContent = genUpdDtoCode({ modelName });

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(updateDtoUrl)) {
      fs.writeFileSync(updateDtoUrl, updateDtoContent);
    }

    ///* index dto -------------------
    const indexDtoUrl = `${dtosPath}/index.ts`;
    genIndexDtoCode({ modelName, indexDtoUrl });

    console.log(`******* Dtos created at ${dtosPath} *******`);
  }

  createService() {
    ///* service interface -------------------
    const serviceUrl = `${appUrl}/services/${modelName.toLowerCase()}.service.ts`;
    const serviceContent = genServiceInterfaceCode({ modelName, appName });

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(serviceUrl)) {
      fs.writeFileSync(serviceUrl, serviceContent);
    }
    console.log(`******* Service Interface created at ${serviceUrl} *******`);

    ///* service implementation -------------------
    const serviceImplUrl = `${appUrl}/services/${modelName.toLowerCase()}.service.impl.ts`;
    const serviceImplContent = genServiceImplCode({ modelName, appName });

    // write file if not exists, otherwise do nothing
    if (!fs.existsSync(serviceImplUrl)) {
      fs.writeFileSync(serviceImplUrl, serviceImplContent);
    }

    // index file -------------------
    const indexServiceUrl = `${appUrl}/services/index.ts`;
    genIndexService({ modelName, indexServiceUrl });

    console.log(
      `******* Service Implementation created at ${serviceImplUrl} *******`
    );
  }

  createController() {
    const controllerUrl = `${appUrl}/controllers/${modelName.toLowerCase()}.controller.ts`;
    const controllerContent = genControllerCode({ modelName });

    const directory = path.dirname(controllerUrl);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Ahora, escribe el archivo si no existe
    if (!fs.existsSync(controllerUrl)) {
      fs.writeFileSync(controllerUrl, controllerContent);
    }

    // create index file -------------------
    const indexControllerUrl = `${appUrl}/controllers/index.ts`;
    genControllerIndexCode({ modelName, indexControllerUrl });
  }

  createRoutes() {
    const routesUrl = `${appUrl}/routes/${modelName.toLowerCase()}.routes.ts`;
    const routesContent = genRoutesCode({ modelName });

    const directory = path.dirname(routesUrl);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Ahora, escribe el archivo si no existe
    if (!fs.existsSync(routesUrl)) {
      fs.writeFileSync(routesUrl, routesContent);
    }

    // create index file -------------------
    const indexRoutesUrl = `${appUrl}/routes/index.ts`;
    genRoutesIndexCode({ modelName, indexRoutesUrl });

    console.log(`******* Routes created at ${routesUrl}.ts *******`);
  }

  ///* upd common files -------------------
  updateDIContainer() {
    const diContainerUrl = `./src/shared/infrastructure/config/di-container.ts`;
    // const modelsText = '// models';
    const modelsEndText = '// models-end';
    // const servicesText = '// services';
    const servicesEndText = '// services-end';
    // const controllersText = '// controllers';
    const controllersEndText = '// controllers-end';
    const importsEndText = '// imports-end';

    handleDIContainerCode({
      diContainerUrl,
      modelName,
      appName,
      modelsEndText,
      servicesEndText,
      controllersEndText,
      importsEndText,
    });

    console.log(`******* DI Container updated at ${diContainerUrl} *******`);
  }

  private capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

const mainCommand = new MainCommand();
mainCommand.start();
