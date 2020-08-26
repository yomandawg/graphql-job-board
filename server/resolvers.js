const db = require('./db');

const resolvers = {
  Query: {
    job: (root, { id }) => db.jobs.get(id),
    jobs: () => db.jobs.list(),
    company: (root, { id }) => db.companies.get(id)
  },
  Mutation: {
    createJob: (root, { input }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }
      const id = db.jobs.create({ ...input, companyId: user.companyId });
      return db.jobs.get(id);
    },
    deleteJob: (root, { id }, { user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }
      const job = db.jobs.get(id);
      db.jobs.delete(id);
      return job;
    }
  },
  Job: {
    company: (job) => db.companies.get(job.companyId)
  },
  Company: {
    jobs: (company) =>
      db.jobs.list().filter((job) => job.companyId === company.id)
  }
};

module.exports = resolvers;
