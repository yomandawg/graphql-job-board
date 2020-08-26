import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache
} from 'apollo-boost';
import gql from 'graphql-tag';
import { getAccessToken, isLoggedIn } from './auth';

const endpointURL = 'http://localhost:9000/graphql';

// request preprocessor
const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    // properties to be used in the request
    operation.setContext({
      // used in `HttpLink`
      headers: {
        authorization: 'Bearer ' + getAccessToken()
      }
    });
  }

  return forward(operation); // the next function
});

const client = new ApolloClient({
  link: ApolloLink.from([
    // Link chaining
    authLink,
    new HttpLink({ uri: endpointURL })
  ]),
  cache: new InMemoryCache({})
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    company {
      id
      name
    }
    description
  }
`;

const loadJobQuery = gql`
  query LoadJobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const loadJobsQuery = gql`
  query LoadJobsQuery {
    jobs {
      id
      title
      company {
        id
        name
      }
    }
  }
`;

const createJobMutation = gql`
  mutation CreateJobMutation($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const deleteJobMutation = gql`
  mutation DeleteJobMutation($id: ID!) {
    deleteJob(id: $id) {
      id
    }
  }
`;

const loadCompanyQuery = gql`
  query LoadCompanyQuery($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;

export async function createJob(input) {
  const {
    data: { job }
  } = await client.mutate({
    mutation: createJobMutation,
    variables: { input },
    update: (
      cache, // or store
      { data } // from the graphql response
    ) => {
      // take the data from the response save it to the cache as if it was running specified query
      cache.writeQuery({
        query: loadJobQuery,
        variables: { id: data.job.id },
        data
      });
    }
  });

  return job;
}

export async function deleteJob(id) {
  const {
    data: { job }
  } = await client.mutate({
    mutation: deleteJobMutation,
    variables: { id },
    update: (cache, { data }) => {
      // TODO: update jobs cache
    }
  });

  return job;
}

export async function loadCompany(id) {
  const {
    data: { company }
  } = await client.query({ query: loadCompanyQuery, variables: { id } });

  return company;
}

export async function loadJobs() {
  const {
    data: { jobs }
  } = await client.query({ query: loadJobsQuery, fetchPolicy: 'no-cache' });

  return jobs;
}

export async function loadJob(id) {
  const {
    data: { job }
  } = await client.query({
    query: loadJobQuery,
    variables: { id }
  });

  return job;
}
