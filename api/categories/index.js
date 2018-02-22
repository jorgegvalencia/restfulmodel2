import controller from './controller';
import service from './service';

export default ({ utils, db }) => {
  const { fs, path, yaml } = utils;
  const swagger = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './definitions.yaml'), 'utf8'));
  return {
    controller,
    service,
    swagger,
  };
};
