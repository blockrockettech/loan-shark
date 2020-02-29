import Vue from 'vue';
import Vuex from 'vuex';
import {ethers} from 'ethers';

import axios from 'axios';
import utils from '../utils';
import _ from 'lodash';
import ERC20Airdropper from '../truffleconf/ERC20Airdropper';
import AccessWhitelist from '../truffleconf/AccessWhitelist';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        provider: null,
        signer: null,
        chain: null,
        contracts: null,
        accounts: null,
        account: null,
        tokensInAccount: [],
        lang: 'gb'
    },
    mutations: {
        updateWeb3Objects(state, {provider, signer, chain, contracts, accounts, account}) {
            Vue.set(state, 'provider', provider);
            Vue.set(state, 'signer', signer);
            Vue.set(state, 'chain', chain);
            Vue.set(state, 'contracts', contracts);
            Vue.set(state, 'accounts', accounts);
            Vue.set(state, 'account', account);
        },
        tokensInAccount(state, tokens) {
            console.log("tokensInAccount", tokens);
            state.tokensInAccount = _.sortBy(_.uniqBy(tokens, 'contractAddress'), 'tokenSymbol');
            console.log("tokensInAccount", state.tokensInAccount);
        },
        setLang(state, lang) {
            state.lang = lang;
        }
    },
    actions: {
        async bootstrapWeb3({commit, dispatch}, {provider, signer, chain}) {
            const accounts = await provider.listAccounts();
            const account = accounts && accounts.length ? accounts[0] : null;

            const airdropperAddress = utils.getContractAddressFromTruffleConf(ERC20Airdropper, chain.chainId);
            const accessWhitelistAddress = utils.getContractAddressFromTruffleConf(AccessWhitelist, chain.chainId);
            const contracts = {
                ERC20Airdropper: new ethers.Contract(
                    airdropperAddress,
                    ERC20Airdropper.abi,
                    signer,
                ),
                AccessWhitelist: new ethers.Contract(
                    accessWhitelistAddress,
                    AccessWhitelist.abi,
                    signer
                )
            };

            commit('updateWeb3Objects', {provider, signer, chain, contracts, accounts, account});
            dispatch('getTokensInAccount', {account, chain});
        },
        async getTokensInAccount({state, commit}, {account, chain}) {
            let rootPath = 'https://us-central1-erc20-airdropper.cloudfunctions.net/main/api/chain/1';
            if (chain && chain.chainId === 3) {
                rootPath = 'https://us-central1-erc20-airdropper.cloudfunctions.net/main/api/chain/3';
            }
            if (chain && chain.chainId === 4) {
                rootPath = 'https://us-central1-erc20-airdropper.cloudfunctions.net/main/api/chain/4';
            }

            console.log(`Using ${rootPath}`);
            const {data} = await axios.get(`${rootPath}/wallet/tokens/${account}`, {
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
            if (data && data.tokens) {
                commit('tokensInAccount', data.tokens);
            }
        },
        changeLang({commit}, lang) {
            commit('setLang', lang);
        }
    },
    getters: {
        contracts: state => state.contracts,
        account: state => state.account,
        chain: state => state.chain,
        signer: state => state.signer,
        provider: state => state.provider,
        lang: state => state.lang,
    },
    modules: {}
});
