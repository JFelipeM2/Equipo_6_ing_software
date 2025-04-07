import Docker, { ContainerCreateOptions } from 'dockerode';
import { Duplex } from 'stream';

export class ExternalServicesDependency {
  private docker: Docker;
  private readonly projectNetWorkName: string = `${process.env.project_name}-netWork`;

  public constructor() {
    this.docker = new Docker();
  }

  public async startServices(): Promise<void> {
    try {
      await this.startExternalServices();
    } catch (error) {
      console.error('Error during application startup:', error);
      process.exit(1);
    }
  }

  private async startExternalServices() {
    const servicesRunning = await this.allServicesRunning();
    if (!servicesRunning) {
      console.log('startUpServices...');
      await this.startUpServices();
    }
    console.log('all Services Running already...');
  }

  private async startUpServices() {
    await this.ensureNetworkExists(this.projectNetWorkName);

    const sqlServerContainer = await this.startSqlServerAsync();
    await this.startRedisAsync();
    await this.startGrafanaAsync();
    await this.startMongoDBAsync();
    await this.startElasticsearchAsync();

    await this.createDatabase(sqlServerContainer);
    await this.startKeyCloakAsync();
  }
  private async ensureNetworkExists(networkName: string): Promise<void> {
    const networks = await this.docker.listNetworks();
    const networkExists = networks.some(
      (network) => network.Name === networkName,
    );

    if (!networkExists) {
      await this.docker.createNetwork({
        Name: networkName,
        CheckDuplicate: true,
      });
      console.log(`Network '${networkName}' created.`);
    } else {
      console.log(`Network '${networkName}' already exists.`);
    }
  }

  private async allServicesRunning(): Promise<boolean> {
    const services: boolean[] = await Promise.all([
      await this.checkServiceRunning(
        `${process.env.project_name}_container_service_mongo`,
      ),
      await this.checkServiceRunning(
        `${process.env.project_name}_container_service_redis`,
      ),
      await this.checkServiceRunning(
        `${process.env.project_name}_container_service_grafana`,
      ),
      await this.checkServiceRunning(
        `${process.env.project_name}_container_service_sqlserver`,
      ),
      await this.checkServiceRunning(
        `${process.env.project_name}_container_service_elasticsearch`,
      ),
    ]);
    return services.every((e) => e);
  }

  private async startElasticsearchAsync(): Promise<void> {
    const containerConfig: ContainerCreateOptions = {
      Image: 'elasticsearch:7.17.9',
      Env: ['discovery.type=single-node', 'ES_JAVA_OPTS=-Xms512m -Xmx512m'],
      HostConfig: {
        PortBindings: {
          '9200/tcp': [{ HostPort: '9200' }],
          '9300/tcp': [{ HostPort: '9300' }],
        },
      },
      name: `${process.env.project_name}_container_service_elasticsearch`,
    };

    const container = await this.docker.createContainer(containerConfig);
    await container.start();
    console.log('Elasticsearch container started.');
  }

  private async startRedisAsync(): Promise<void> {
    const imageName = 'redis:latest';
    const imageExists = await this.checkImageExistsLocally(imageName);
    if (!imageExists) {
      await this.pullImage(imageName);
    }
    const containerConfig: ContainerCreateOptions = {
      Image: imageName,
      HostConfig: {
        PortBindings: {
          '6379/tcp': [{ HostPort: '6379' }], // Adjust ports as needed
        },
      },
      name: `${process.env.project_name}_container_service_redis`,
    };
    const container = await this.docker.createContainer(containerConfig);
    await container.start();
    console.log('Redis container started.');
  }

  private async startGrafanaAsync(): Promise<void> {
    const imageName = 'grafana/grafana';
    const imageExists = await this.checkImageExistsLocally(imageName);
    if (!imageExists) {
      await this.pullImage(imageName);
    }
    const containerConfig: ContainerCreateOptions = {
      Image: imageName,
      Env: [
        `GF_SECURITY_ADMIN_PASSWORD=${process.env.GF_SECURITY_ADMIN_PASSWORD}`,
        `GF_SECURITY_ADMIN_USER=${process.env.GF_SECURITY_ADMIN_USER}`,
      ],
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: process.env.service_grafana_host_port }],
        },
      },
      name: `${process.env.project_name}_container_service_grafana`,
    };

    const container = await this.docker.createContainer(containerConfig);
    await container.start();
    console.log('Grafana container started.');
  }

  public async startSqlServerAsync(): Promise<Docker.Container> {
    const imageName = 'mcr.microsoft.com/mssql/server:2022-latest';
    const imageExists = await this.checkImageExistsLocally(imageName);

    if (!imageExists) {
      await this.pullImage(imageName);
    }

    const containerConfig: ContainerCreateOptions = {
      Image: imageName,
      Env: ['ACCEPT_EULA=Y', `SA_PASSWORD=${process.env.database_password}`],
      HostConfig: {
        PortBindings: {
          '1433/tcp': [{ HostPort: `${process.env.database_port}` }],
        },
      },
      name: `${process.env.project_name}_container_service_sqlserver`,
      NetworkingConfig: {
        EndpointsConfig: {
          [this.projectNetWorkName]: {},
        },
      },
    };

    try {
      const container = await this.docker.createContainer(containerConfig);
      await container.start();
      console.log('Sql server container started.');
      return container;
    } catch (error) {
      console.error('Error starting SQL Server container:', error);
    }
  }

  private async startKeyCloakAsync(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const imageName = 'quay.io/keycloak/keycloak:latest';
    const containerConfig: ContainerCreateOptions = {
      Image: imageName,
      Env: [
        `KEYCLOAK_ADMIN=admin`,
        `KEYCLOAK_ADMIN_PASSWORD=change_me`,
        `KC_DB=mssql`,
        `KC_DB_URL=jdbc:sqlserver://${process.env.project_name}_container_service_sqlserver:1433;databaseName=${process.env.database_database_name};encrypt=false`,
        `KC_DB_USERNAME=${process.env.database_username}`,
        `KC_DB_PASSWORD=${process.env.database_password}`,
      ],
      HostConfig: {
        PortBindings: {
          '8080/tcp': [{ HostPort: '8080' }],
        },
      },
      name: `${process.env.project_name}_container_service_keycloak`,
      NetworkingConfig: {
        EndpointsConfig: {
          [this.projectNetWorkName]: {},
        },
      },
      Cmd: ['start-dev'],
    };
    console.log('KeyCloak => ', containerConfig);

    const container = await this.docker.createContainer(containerConfig);
    await container.start();
    console.log('Keycloak container started.');
  }

  private async createDatabase(container: Docker.Container): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 50000));

    const createDbCommand = `/opt/mssql-tools18/bin/sqlcmd -S 127.0.0.1 -U ${process.env.database_username} -P ${process.env.database_password} -Q "CREATE DATABASE ${process.env.database_database_name}; SELECT [name] FROM sys.databases;" -N -C`;
    console.log(createDbCommand);

    try {
      const exec = await container.exec({
        Cmd: ['bash', '-c', createDbCommand],
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await this.startExecStream(exec);
      const response = await this.handleExecStream(stream);
      console.log(response);
    } catch (error) {
      console.error('Error executing SQL query:', error);
    }
  }

  private async startExecStream(exec: Docker.Exec): Promise<Duplex> {
    return new Promise<Duplex>((resolve, reject) => {
      exec.start({}, (err: any, stream: Duplex) => {
        // Pass an empty object as options if no options are needed
        if (err) {
          reject(err);
        } else {
          resolve(stream);
        }
      });
    });
  }

  private async handleExecStream(stream: Duplex): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let output = '';
      stream.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });
      stream.on('end', () => {
        resolve(output);
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  private async startMongoDBAsync(): Promise<void> {
    const imageName = 'mongo:latest';
    const imageExists = await this.checkImageExistsLocally(imageName);
    if (!imageExists) {
      await this.pullImage(imageName);
    }
    const containerConfig: ContainerCreateOptions = {
      Image: imageName,
      Env: [
        'MONGO_INITDB_ROOT_USERNAME=admin',
        'MONGO_INITDB_ROOT_PASSWORD=password',
      ],
      HostConfig: {
        PortBindings: {
          '27017/tcp': [{ HostPort: '27717' }],
        },
      },
      name: `${process.env.project_name}_container_service_mongo`,
    };
    const container = await this.docker.createContainer(containerConfig);
    await container.start();
    console.log('MongoDB container started.');
  }

  private async checkImageExistsLocally(imageName: string): Promise<boolean> {
    try {
      const images = await this.docker.listImages();
      return images.some((image) => image.RepoTags.includes(imageName));
    } catch (error) {
      console.error('Error checking Docker images:', error);
      throw error;
    }
  }

  private async pullImage(imageName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.docker.pull(imageName, {}, (err, stream) => {
        if (err) {
          console.error(`Error pulling image ${imageName}:`, err);
          reject(err);
        } else {
          this.docker.modem.followProgress(stream, (err: any, res: unknown) => {
            if (err) {
              console.error(`Error pulling image ${imageName}:`, err);
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  private async checkServiceRunning(serviceName: string): Promise<boolean> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const container = containers.find((c) =>
        c.Names.includes(`/${serviceName}`),
      );
      return container?.State === 'running';
    } catch (error) {
      console.error(`Error checking status:`, error);
      return false;
    }
  }
}
