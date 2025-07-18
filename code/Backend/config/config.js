import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const onosUrl = process.env.ONOS_URL || 'http://localhost:8181/onos/v1';
export const onosAuth = {
    username: process.env.ONOS_USERNAME || 'onos',
    password: process.env.ONOS_PASSWORD || 'rocks'
};