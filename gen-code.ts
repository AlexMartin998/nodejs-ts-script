import fs from 'fs';

export const genModelCode = ({ modelName }: { modelName: string }) => {
  return `import mongoose from 'mongoose';
    
const ${modelName.toLowerCase()}Schema = new mongoose.Schema(
  {
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ${modelName}Model = mongoose.model('${modelName}', ${modelName.toLowerCase()}Schema);`;
};

export const genCreateDtoCode = ({ modelName }: { modelName: string }) => {
  return `import { z } from 'zod';

import { InvalidArgumentError, Nullable } from '@/shared/domain';
import { handleDtoValidation } from '@/shared/infrastructure/utils';

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
};

export const genUpdDtoCode = ({ modelName }: { modelName: string }) => {
  return `import { InvalidArgumentError, Nullable } from '@/shared/domain';
import { handleDtoValidation } from '@/shared/infrastructure/utils';
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
};

export const getResponseDtoCode = ({ modelName }: { modelName: string }) => {
  return `export class ${modelName + 'Dto'} {
  private constructor(
    public readonly id: string,
  ) {}

  static create(props: Record<string, any>): ${modelName + 'Dto'} {
    const { _id } = props;
    return new ${modelName + 'Dto'}(_id);
  }
}`;
};

export const genIndexDtoCode = ({
  modelName,
  indexDtoUrl,
}: {
  modelName: string;
  indexDtoUrl: string;
}) => {
  const indexDtoContent = `export * from './${modelName.toLowerCase()}.dto';
export * from './create-${modelName.toLowerCase()}.dto';
export * from './update-${modelName.toLowerCase()}.dto';`;

  // write file if not exists, otherwise add new imports at the end
  if (!fs.existsSync(indexDtoUrl)) {
    fs.writeFileSync(indexDtoUrl, indexDtoContent);
  } else {
    const data = fs.readFileSync(indexDtoUrl, 'utf-8');
    if (
      !data.includes(`export * from './create-${modelName.toLowerCase()}.dto';`)
    ) {
      fs.appendFileSync(
        indexDtoUrl,
        `\nexport * from './create-${modelName.toLowerCase()}.dto';\n`
      );
    }
    if (
      !data.includes(`export * from './update-${modelName.toLowerCase()}.dto';`)
    ) {
      fs.appendFileSync(
        indexDtoUrl,
        `export * from './update-${modelName.toLowerCase()}.dto';\n`
      );
    }
  }

  console.log('Index DTO file created/updated');
};

export const genServiceInterfaceCode = ({
  modelName,
  appName,
}: {
  modelName: string;
  appName: string;
}) => {
  const resPonseNameDto = modelName + 'Dto';

  return `import { Create${modelName}Dto, Upd${modelName}Dto, ${resPonseNameDto} } from '@/${appName}/dtos';
import { PaginationDto, PaginationResponseDto } from '@/shared/dtos';

export interface ${modelName}Service {
  create(createDto: Create${modelName}Dto): Promise<${resPonseNameDto}>;
  
  findAll(
    paginationDto: PaginationDto
  ): Promise<PaginationResponseDto<${resPonseNameDto}>>;

  findOne(id: string): Promise<${resPonseNameDto}>;

  update(id: string, updDto: Upd${modelName}Dto): Promise<${resPonseNameDto}>;

  delete(id: string): Promise<void>;
}
`;
};

export const genServiceImplCode = ({
  modelName,
  appName,
}: {
  modelName: string;
  appName: string;
}) => {
  const resPonseNameDto = modelName + 'Dto';

  return `import { Create${modelName}Dto, Upd${modelName}Dto, ${resPonseNameDto} } from '@/${appName}/dtos';
import { ${modelName}Service } from './${modelName.toLowerCase()}.service';
import { ${modelName}Model } from '../models';
import { PaginationDto, PaginationResponseDto } from '@/shared/dtos';
import { ResourceNotFoundError } from '@/shared/domain';


export class ${modelName}ServiceImpl implements ${modelName}Service {

  constructor(private readonly ${modelName.toLowerCase()}Model: typeof ${modelName}Model) {}

  async create(createDto: Create${modelName}Dto): Promise<${resPonseNameDto}> {
    const ${modelName.toLocaleLowerCase()} = await this.${modelName.toLowerCase()}Model.create(createDto);

    return ${resPonseNameDto}.create(${modelName.toLocaleLowerCase()}!);
  }

  async findAll(
    paginationDto: PaginationDto
  ): Promise<PaginationResponseDto<${resPonseNameDto}>> {
    const { page, limit } = paginationDto;
    const [total, ${modelName.toLocaleLowerCase()}s] = await Promise.all([
      this.${modelName.toLowerCase()}Model.countDocuments(),
      this.${modelName.toLowerCase()}Model
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return PaginationResponseDto.create<${resPonseNameDto}>(
      page,
      limit,
      total,
      ${modelName.toLocaleLowerCase()}s.map(${resPonseNameDto}.create)
    );
  }

  async findOne(id: string): Promise<${resPonseNameDto}> {
    const ${modelName.toLocaleLowerCase()} = await this.findOneById(id);
    if (!${modelName.toLocaleLowerCase()}) throw new ResourceNotFoundError('${modelName} not found');
    return ${resPonseNameDto}.create(${modelName.toLocaleLowerCase()});
  }

  async update(id: string, updDto: Upd${modelName}Dto): Promise<${resPonseNameDto}> {
    const ${modelName.toLocaleLowerCase()} = await this.${modelName.toLowerCase()}Model.findByIdAndUpdate(id, updDto, { new: true });
    if (!${modelName.toLocaleLowerCase()}) throw new ResourceNotFoundError('${modelName} not found');

    return ${resPonseNameDto}.create(${modelName.toLocaleLowerCase()});
  }

  async delete(id: string): Promise<void> {
    const res = await this.${modelName.toLowerCase()}Model.findByIdAndDelete(id);
    if (!res) throw new ResourceNotFoundError('${modelName} not found');
  }

  private async findOneById(id: string): Promise<any> {
    return this.${modelName.toLowerCase()}Model.findById(id) || null;
  }
}
`;
};

export const genIndexService = ({
  modelName,
  indexServiceUrl,
}: {
  modelName: string;
  indexServiceUrl: string;
}) => {
  const indexServiceContent = `export * from './${modelName.toLowerCase()}.service';
export * from './${modelName.toLowerCase()}.service.impl';`;
  // write file if not exists, otherwise add new imports at the end
  if (!fs.existsSync(indexServiceUrl)) {
    fs.writeFileSync(indexServiceUrl, indexServiceContent);
  } else {
    const data = fs.readFileSync(indexServiceUrl, 'utf-8');
    if (
      !data.includes(`export * from './${modelName.toLowerCase()}.service';`)
    ) {
      fs.appendFileSync(
        indexServiceUrl,
        `\nexport * from './${modelName.toLowerCase()}.service';\n`
      );
    }
    if (
      !data.includes(
        `export * from './${modelName.toLowerCase()}.service.impl';`
      )
    ) {
      fs.appendFileSync(
        indexServiceUrl,
        `export * from './${modelName.toLowerCase()}.service.impl';\n`
      );
    }
  }

  console.log('Index Service file created/updated');
};

export const genControllerCode = ({
  modelName,
}: {
  modelName: string;
  appName?: string;
}) => {
  return `import { Request, Response } from 'express';

import { PaginationDto } from '@/shared/dtos';
import { handleRestExceptions } from '@/shared/infrastructure/server/utils';
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
        const { page = 1, limit = 10 } = req.query;
        const paginationDto = PaginationDto.create(+page, +limit);
        const ${modelName.toLocaleLowerCase()}s = await this.${modelName.toLowerCase()}Service.findAll(paginationDto!);

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
};

export const genControllerIndexCode = ({
  modelName,
  indexControllerUrl,
}: {
  modelName: string;
  indexControllerUrl: string;
}) => {
  const indexControllerContent = `export * from './${modelName.toLowerCase()}.controller';`;
  // write file if not exists, otherwise add new imports at the end
  if (!fs.existsSync(indexControllerUrl)) {
    fs.writeFileSync(indexControllerUrl, indexControllerContent);
  } else {
    const data = fs.readFileSync(indexControllerUrl, 'utf-8');
    if (
      !data.includes(`export * from './${modelName.toLowerCase()}.controller';`)
    ) {
      fs.appendFileSync(
        indexControllerUrl,
        `\nexport * from './${modelName.toLowerCase()}.controller';\n`
      );
    }
  }
};

export const genRoutesCode = ({ modelName }: { modelName: string }) => {
  return `import { Router } from 'express';

import { diContainer } from '@/shared/infrastructure/config';
import { ${modelName}Controller } from '../controllers';

export class ${modelName}Routes {
  static get routes(): Router {
    const router = Router();

    const ${modelName.toLocaleLowerCase()}Controller = diContainer.resolve<${modelName}Controller>('${modelName.toLocaleLowerCase()}Controller');

    router.post('/', (req, res) => ${modelName.toLocaleLowerCase()}Controller.create(req, res));
    router.get('/', (req, res) => ${modelName.toLocaleLowerCase()}Controller.findAll(req, res));
    router.get('/:id', (req, res) => ${modelName.toLocaleLowerCase()}Controller.findOne(req, res));
    router.patch('/:id', (req, res) => ${modelName.toLocaleLowerCase()}Controller.update(req, res));
    router.delete('/:id', (req, res) => ${modelName.toLocaleLowerCase()}Controller.delete(req, res));

    return router;
  }
}`;
};

export const genRoutesIndexCode = ({
  modelName,
  indexRoutesUrl,
}: {
  modelName: string;
  indexRoutesUrl: string;
}) => {
  const indexRoutesContent = `export * from './${modelName.toLowerCase()}.routes';`;
  // write file if not exists, otherwise add new imports at the end
  if (!fs.existsSync(indexRoutesUrl)) {
    fs.writeFileSync(indexRoutesUrl, indexRoutesContent);
  } else {
    const data = fs.readFileSync(indexRoutesUrl, 'utf-8');
    if (
      !data.includes(`export * from './${modelName.toLowerCase()}.routes';`)
    ) {
      fs.appendFileSync(
        indexRoutesUrl,
        `\nexport * from './${modelName.toLowerCase()}.routes';\n`
      );
    }
  }

  console.log('Index Routes file created/updated');
};

//* ====================
export const handleDIContainerCode = ({
  diContainerUrl,
  modelName,
  appName,
  importsEndText,
  modelsEndText,
  servicesEndText,
  controllersEndText,
}: {
  diContainerUrl: string;
  modelName: string;
  appName: string;
  importsEndText: string;
  modelsEndText: string;
  servicesEndText: string;
  controllersEndText: string;
}) => {
  // Read file
  const data = fs.readFileSync(diContainerUrl, 'utf-8');
  const lines = data.split('\n');

  // Add import
  let importLine = `import { ${modelName}Model } from '@/${appName}/models';`;
  const importEndIndex = lines.findIndex(line => line.includes(importsEndText));
  lines.splice(importEndIndex, 0, importLine);
  importLine = `import { ${modelName}ServiceImpl } from '@/${appName}/services';`;
  lines.splice(importEndIndex, 0, importLine);
  importLine = `import { ${modelName}Controller } from '@/${appName}/controllers';`;
  lines.splice(importEndIndex, 0, importLine);

  // Add model
  const modelLine = `    ${modelName.toLowerCase()}Model: asValue(${modelName}Model),`;
  const modelEndIndex = lines.findIndex(line => line.includes(modelsEndText));
  lines.splice(modelEndIndex, 0, modelLine);

  // Add service
  const serviceLine = `    ${modelName.toLowerCase()}Service: asClass(${modelName.concat(
    'ServiceImpl'
  )}),`;
  const serviceEndIndex = lines.findIndex(line =>
    line.includes(servicesEndText)
  );
  lines.splice(serviceEndIndex, 0, serviceLine);

  // Add controller
  const controllerLine = `    ${modelName.toLowerCase()}Controller: asClass(${modelName.concat(
    'Controller'
  )}),`;
  const controllerEndIndex = lines.findIndex(line =>
    line.includes(controllersEndText)
  );
  lines.splice(controllerEndIndex, 0, controllerLine);

  // Write file
  fs.writeFileSync(diContainerUrl, lines.join('\n'));
};
