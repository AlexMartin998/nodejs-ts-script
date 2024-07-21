# Node.js + TS + Awilix Script Documentation | [MongoDB - Mongoose]

This documentation provides an overview of how to use the custom script for creating applications and models in a Node.js + TypeScript project using Awilix for dependency injection.

```sh
bun ./__ts__/main.ts --create_app --app_name="candies" --model_name="Candy"

bun ./__ts__/main.ts --app_name="candies" --model_name="Juice"
```

## Prerequisites

- Node.js installed on your system.
- TypeScript installed globally or in your project.
- Awilix installed in your project for dependency injection.

## Usage

The script can be executed with the `bun` command, providing different options for creating applications and models.

### Creating a Model within an Application

To create a new model within an application, use the following command structure:

```sh
bun ./__ts__/main.ts --app_name="<YourAppName>" --model_name="<YourModelName>"
```

Replace <YourAppName> with the name of your application and <YourModelName> with the name of the model you want to create

- Example:

```sh
bun ./__ts__/main.ts --app_name="books" --model_name="Publisher"
```

This command creates a new model named Publisher within the books application.

## Creating a New Application with a Model

To create a new application along with a model, use the command with the `--create_app` flag:

```sh
bun ./__ts__/main.ts --create_app --app_name="<YourAppName>" --model_name="<YourModelName>"
```


Replace <YourAppName> with the name of the application you want to create and <YourModelName> with the name of the initial model within this application.

- Example:

```sh
bun ./__ts__/main.ts --create_app --app_name="candies" --model_name="Candy"
```


This command creates a `new application` named candies and an initial model named `Candy` within it.


### Notes

- Ensure that the bun command is properly installed and configured in your environment.
- The script paths and names are case-sensitive. Make sure to match the exact case of your application and model names.
- This script is designed to streamline the creation of applications and models in projects using Awilix for dependency injection, making it easier to maintain a clean architecture.
