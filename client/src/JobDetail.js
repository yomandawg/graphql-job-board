import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import { jobs } from './fake-data';
import { loadJob, deleteJob } from './requests';

export class JobDetail extends Component {
  constructor(props) {
    super(props);
    this.state = { job: null };
  }

  async componentDidMount() {
    const { jobId } = this.props.match.params;
    const job = await loadJob(jobId);

    if (!job) {
      this.props.history.push('/');
    }

    this.setState({ job });
  }

  onDelete() {
    const { jobId } = this.props.match.params;
    deleteJob(jobId);

    this.props.history.push('/');
  }

  render() {
    const { job } = this.state;

    if (!job) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <h1 className="title">{job.title}</h1>
        <h2 className="subtitle">
          <Link to={`/companies/${job.company.id}`}>{job.company.name}</Link>
        </h2>
        <div className="box">{job.description}</div>
        <button onClick={this.onDelete.bind(this)}>Delete Post</button>
      </div>
    );
  }
}
