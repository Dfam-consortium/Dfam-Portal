# Dfam

Web portal for the Dfam resource ( www.dfam.org ).  Dfam is a collection of DNA
Transposable Element sequence alignments, hidden Markov Models (HMMs),
consensus sequences, and genome annotations. The portal is based on Angular 10.x
and requires an instance of the REST Dfam-API running on the same machine.

## Dependencies

All client-side dependencies are specified in `package.json` or shipped in
`src/assets`. Run `npm install` to download these dependencies before the first
run and whenever dependencies have changed.

For development and testing you will need to install `@angular/cli` globally
(for example with `npm install -g`), and ensure that the included `ng` command
is on your `PATH` (or specify the full path to it when necessary).

The app expects a Dfam-API server to be deployed or proxied in such a way that
`/api/` reaches it, and the same for Dfam-Backend-API at `/api/backend/`. This
is specified in `src/app/shared/dfam-api/dfam-api.service.ts`.
`src/proxy.conf.json` can be used to redirect this path at developement time.
For convenience, `src/proxy.conf.json.public` is provided as an example to use
the live API at https://www.dfam.org/

## Development server

Run `ng serve` for a dev server, optionally with `--port <port>`, and navigate
to `http://localhost:10050/`. The app will automatically reload if you change
any of the source files.

For testing in IE, you will need to run `ng serve --configuration es5`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can
also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the
`dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via
[Karma](https://karma-runner.github.io).

## Running end-to-end tests

Running Cypress
```
npx cypress open
```

## Further help

To get more help please submit a request through the issue tracker at
https://github.com/Dfam-consortium/Dfam-Portal or email help@dfam.org.
