import React from 'react';
import { Link } from 'react-router';

class Person extends React.Component {
    constructor() {
        super();

        this.remove = this.remove.bind(this);
        this.flip = this.flip.bind(this);
    }

    getAdults() {
        const { person } = this.props;

        return parseInt(person.adults_f, 10) + parseInt(person.adults_m, 10);
    }

    remove(e) {
        e.preventDefault();
        const { person } = this.props;
        return fetch(`/api/person/${person.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => { this.props.fetchPeople() }); // TODO update people state instead of refetching
    }

    flip(e) {
        e.preventDefault();
        const { person } = this.props;
        fetch(`/api/person/${person.id}/flip`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => { this.props.fetchPeople() }); // TODO update people state instead of refetching
    }

    render() {
        const { person } = this.props;

        return <li>
            <span className="title">{this.getAdults()} adults. {person.children} children.</span><span className="type">{person.type}</span>
            <div className={'info'}>
                <span className="name">{person.name}</span> <span className="info">{person.age} år. {person.adults_f} females. {person.adults_m} males.</span> <span className="origin">{person.origin}.</span> <br />
                <span className="phone">Phone: <a href={`tel:${person.phone}`}>{person.phone}</a></span> <span className="email">Email <a href={`mailto:${person.email}`}>{person.email}</a></span> <br />
                <span className="address">{person.address} {person.zipcode}</span> <br />
                <span className="bringing">{person.bringing || <i>No people description</i>}</span> <br />
                <span className="freetext">{person.freetext || <i>No description</i>}</span> <br />
                <a href="#" onClick={this.flip}>Change person to other type</a> <br />
                <a href="#" onClick={this.remove}>Remove person from database</a>
            </div>
        </li>
    }
}

export default class People extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            people: [],
            meta: {page: 1, limit: 10}
            // ,
            // status: '1'
        };
        this.fetchPeople = this.fetchPeople.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.prevPage = this.prevPage.bind(this);
        this.gotoPage = this.gotoPage.bind(this);
    }

    componentDidMount() {
        this.fetchPeople();
    }

    fetchPeople() {
        return fetch(`/api/people?page=${this.state.meta.page}`, { // ?status=${this.state.status}
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            var meta = {
                count: res.headers.get('X-Count'),
                page: res.headers.get('X-Page'),
                offset: res.headers.get('X-Offset'),
                total: res.headers.get('X-Total'),
                limit: res.headers.get('X-Limit')
            };
            this.setState({meta});
            return res.json();
        }).then(people => { // brab meta data from Headers
            this.setState({ people })
        });
    }

    nextPage(e) {
        e.preventDefault();
        var max = Math.ceil(this.state.meta.total / this.state.meta.limit);
        if (this.state.meta.page < max)
            this.state.meta.page++;
        this.fetchPeople();
    }

    prevPage(e) {
        e.preventDefault();
        if (this.state.meta.page > 1)
            this.state.meta.page--;
        this.fetchPeople();
    }

    gotoPage(e) {
        e.preventDefault();
        this.state.meta.page = e.target.getAttribute("data-page");
        this.fetchPeople();
    }

    render() {
        var N = Math.ceil(this.state.meta.total / this.state.meta.limit);
        var pages = Array.apply(null, {length: N}).map(Number.call, Number); // + 1
        return <div>
            <div className="people">
                <h1> People are strange </h1>
                <ul>
                    {this.state.people.map(person => {
                        return <Person key={person.id} person={person} fetchPeople={this.fetchPeople} />
                    })}
                </ul>
            </div>
            <div  className="pagination">
                <ul>
                    <li><button name="prev" onClick={this.prevPage}>Previous</button></li>
                    {pages.map((p) => {
                         p = p + 1;
                        return <li key={p}><button data-page={p} onClick={this.gotoPage}> {p} </button></li>
                    })}
                    <li><button name="next" onClick={this.nextPage}>Next</button> </li>
                </ul>
                <p>Showing {this.state.meta.count} of {this.state.meta.total}, page {this.state.meta.page}</p>
            </div>
        </div>

    }
}