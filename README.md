# evolution

A d3 life simulator in which rendered 'Eves' randomly mutate and evolve over time in pursuit of optimization of a defined survival condition on a custom, 2D physics environment

## How it works

To start, a set of eves are randomly created based on the set of defineable properties. Every few seconds, the lowest-performing eve is destroyed, and a new one is created based on an existing eve with some slight mutation.

The current survival condition tests for the average speed of each eve and destroys the slowest each cycle.

Each eve is represented as a graph with body parts as the nodes and limbs as the connections. The current mutable properties are as follows:

__Body parts:__
- Mass
- Relative position
- Count
- Color

__Limbs:__
- Max Length
- Count

The evolution runs continuously on the server. When a client requests the page, it receives a copy of the evolution code (with the addition of d3 for visual rendering) plus the current state of the eves. The client copy will then diverge from the server state and the client's system will determine the random mutations.

## Requirements
- docker [install here](https://docs.docker.com/engine/installation/)
- npm (if not running via docker) [install here](http://blog.npmjs.org/post/85484771375/how-to-install-npm)
- postgreSQL (if not running via docker) [install here](http://www.postgresql.org/download/)

## Setup

Create a file called 'config.json' within /server/db directory by copying 'config.example.json'. This file is used by the server to connect to a postgres DB depending on the run environment. You may need to edit the username and password parameters to run locally (see below).

Evolution is setup to be developed and run either locally, or on a local or deployed docker-machine. Depending on which method you use, you will need to update the HTTP request in client/evolution.js to ensure the client is asking for the eve data from the correct address.

### Run via Docker

Docker provides a means of packaging applications and their relevant dependencies into blank Linux 'containers' to ensure consistency between development and production environments. Evolution requires two containers, one to host the Node server, and one to host the Postgres database. 

Starting up the server is a two-step process:

1. Build an image of the app and any dependencies
2. Start up containers based on the images

These steps correspond to two files in the root directory:

* 'Dockerfile' provides instructions for how to build the app image and install dependencies
* 'docker-compose.yml' provides instructions to setup the environment and run the containers

Use the following instructions to run the Thumbroll server via docker:

__Step 1: Install Docker__

If you don't have it already, you will need to install the [Docker toolbox](https://docs.docker.com/engine/installation/mac/). This will enable you to setup Docker machines, build Docker images, and compose containers.

__Step 2: Select docker-machine__


```
$ docker-machine ls
```

The machine marked with an asterix is currently active. To select a docker-machine, run

```
$ eval $(docker-machine env [name of docker-machine]))
```

__Step 3: Compose containers__

The docker yml file will instruct the docker-machine on how to build the thumbroll image, run the container,
and connect it to a postgres container. Run the following in the command line to compose the containers and
run the node and postgres processes in the background

```
$ docker-compose up -d
```

To see all running containers on the machine, run the command

```
$ docker ps
```

Use the '-a' flag to view all containers, as opposed to just those which are running.

To see the most recent logs from a container process, run

```
$ docker logs [container ID]
```

__Step 4: Confirm Docker IP address__

Assuming there are no issues, the server should be up and running. In order for the client to communicate with the server, you will need to set the appropriate IP address in '/client/evolution.js'. To get IP from your docker-machine, run

```
$ docker-machine ip [name of docker-machine]
```

__Step 5: Deploy to Digital Ocean (optional)__

Digital Ocean provides an easy way to deploy your Docker containers directly from your terminal. [Click here for instructions.](https://docs.docker.com/machine/drivers/digital-ocean/)

### Run locally

Instead of running the server within Docker containers, the server may also be run locally.

__Step 1: Install Postgres__

```
$ brew update
$ brew install postgres
```

__Step 2: Create Postgres defaults__

```
$ createdb
$ createrole <<create username>>
```

Plug this username into the relevant position within '/server/db/config.json' according to example file.

__Step 3: Create evolution DB__

```
$ createdb evolution
```

__Step 4: Startup Postgres__

```
$ postgres -D /usr/local/var/postgres
```

__Step 5: Install dependencies__ 

```
$ npm install
```

__Step 6: Start server__

```
$ npm start
```

__Step 7: Access DB (optional)__

Use the following command to access the evolution DB and query it directly:

```
$ psql evolution
```

Note that semicolons are required at the end of each query statement.

## Future Development

Check out progress and upcoming developments:

[![Stories in Backlog](https://badge.waffle.io/iandeboisblanc/evolution.svg?label=backlog&title=Backlog)![Stories in Ready](https://badge.waffle.io/iandeboisblanc/evolution.svg?label=ready&title=Ready)![Stories in Progress](https://badge.waffle.io/iandeboisblanc/evolution.svg?label=waffle%3Ain%20progress&title=In%20Progress)](http://waffle.io/iandeboisblanc/evolution)
