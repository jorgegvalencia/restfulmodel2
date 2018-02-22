const request = require('supertest');

module.exports = ({ Application, basePath }) => (next) => {
  const channelPath = `${basePath}/categories`;

  describe(`Categories ${channelPath}`, () => {
    it('Getter', (done) => {
      request(Application)
        .get(channelPath)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, () => {
          done();
          next();
        });
    });
  });
};
