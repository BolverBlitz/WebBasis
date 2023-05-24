import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 100 },
        { duration: '30s', target: 4000 },
        { duration: '5s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(99)<1500'], // global http request duration threshold
    },
};

const BASE_URL = 'http://localhost:80/api/v1'; // replace with your app's URL

export default function () {
    let responses = http.batch([
        ['GET', `${BASE_URL}/bench/limcache`],
        ['GET', `${BASE_URL}/bench/lim`],
        ['GET', `${BASE_URL}/bench/cache`],
        ['GET', `${BASE_URL}`]
    ]);

    for (let response of responses) {
      check(response, {
        'got 200': (r) => r.status === 200
      });
    }

    sleep(1);
}
