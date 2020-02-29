<template>
    <div class="container">
        <h1 class="text-center">Yello</h1>

    </div>
</template>

<script>
    import {mapGetters, mapState} from 'vuex';
    import utils from '../utils';
    import ERC20Airdropper from '../truffleconf/ERC20Airdropper';
    import {ethers} from 'ethers';
    import erc20Abi from '../abi/erc20.abi';
    import _ from 'lodash';
    import $ from 'jquery';
    import notify from 'bnc-notify';

    const notifyInstance = notify({
        dappId: '93470207-965c-447c-b3c5-31851a1fb2e7',
        networkId: 1,
        darkMode: true,
        desktopPosition: 'topRight',
    });

    export default {
        name: "Index",
        components: {},
        computed: {
            ...mapState(['tokensInAccount']),
            ...mapGetters(['contracts', 'account', 'chain', 'signer', 'provider']),
            airdropData() {
                return {
                    addressCount: this.rowLen,
                    tokenCount: this.totalValue,
                    allowance: this.allowance,
                    balance: this.balance,
                    txCount: this.batchLen,
                    pricePerTxInEth: this.pricePerTxInWei ? ethers.utils.formatEther(this.pricePerTxInWei) : null,
                };
            },
            hasEnoughAllowance() {
                return this.allowance && this.totalValue && Number(this.allowance) >= Number(this.totalValue);
            },
            totalStepsRequiredToSetupAirdrop() {
                return this.hasEnoughAllowance ? 2 : 3;
            },
            currentStep() {
                if (this.totalStepsRequiredToSetupAirdrop === 2 && this.wizard.currentStep === 3) {
                    return 2;
                } else {
                    return this.wizard.currentStep;
                }
            },
            invalidRows() {
                if (!this.form.csvData) return [];
                const csvArray = this.csvDataToArrays(this.form.csvData);

                const invalidRows = [];
                csvArray.forEach((row, idx) => {
                    // Row invalid if true
                    if (row.length === 1) {
                        invalidRows.push(
                            [
                                row[0] && row[0].trim() ? row[0].trim() : 'Undefined',
                                'Undefined',
                                idx + 1
                            ]
                        );
                        return;
                    }

                    // Check address
                    const address = row[0] && row[0].trim() ? row[0].trim() : null;
                    if (!address) {
                        invalidRows.push(
                            [
                                ...row,
                                idx + 1
                            ]
                        );
                        return;
                    }
                    try {
                        ethers.utils.getAddress(address);
                    } catch (e) {
                        invalidRows.push(
                            [
                                ...row,
                                idx + 1
                            ]
                        );
                        return;
                    }

                    //Validate value supplied
                    if (row.length === 2 && !row[1]) {
                        // Empty value supplied
                        invalidRows.push(
                            [
                                row[0],
                                'Undefined',
                                idx + 1
                            ]
                        );
                        return;
                    }

                    if (row.length > 2) {
                        // Too many delimiters / values supplied
                        invalidRows.push(
                            [
                                'Undefined',
                                'Undefined',
                                idx + 1
                            ]
                        );
                        return;
                    }
                });

                return invalidRows;
            },
            csvDataFilteredForValidRowsOnly() {
                if (!this.form.csvData) return [];

                return (this.csvDataToArrays(this.form.csvData) || []).filter(row => {
                    // Row invalid if true
                    if (row.length === 1) {
                        return false;
                    }

                    if (row.length === 2 && !row[1]) {
                        // Empty value supplied
                        return false;
                    }

                    if (row.length > 2) return false;

                    const address = row[0] && row[0].trim() ? row[0].trim() : null;
                    if (!address) return false;
                    try {
                        ethers.utils.getAddress(address);
                        return true;
                    } catch (e) {
                        return false;
                    }
                });
            },
            notEnoughCredits() {
                if (!this.credits || !this.batchLen) return false;
                const credits = Number(this.credits);
                return credits > 0 && (Number(this.batchLen) > credits);
            }
        },
        data() {
            return {
                mazBatchSize: 200,
                credits: null,
                pricePerTxInWei: null,
                pricePerTx: null,
                balance: null,
                valid: null,
                rowLen: null,
                batchLen: null,
                totalValue: null,
                allowance: null,
                symbol: null,
                decimals: null,
                approving: false,
                approveTx: null,
                airdropTxs: [],
                confirmedAirdropTxs: [],
                airdropping: false,
                airdropComplete: false,
                range: 1.5,
                form: {
                    token: null,
                    file: null,
                    amountToApprove: null,
                    csvData: null,
                },
                wizard: {
                    currentStep: 1,
                    stepInfo: 'Configure Airdrop Params (Push)'
                }
            };
        },
        methods: {
            setSelected(value) {
                this.form.token = value ? value.contractAddress : '';
                this.checkAllowance();
            },
            filterBy(option, label, search) {
                if (option.tokenSymbol && option.tokenSymbol.toLowerCase().indexOf(search.toLowerCase()) > -1) {
                    return true;
                }
                if (option.tokenName && option.tokenName.toLowerCase().indexOf(search.toLowerCase()) > -1) {
                    return true;
                }
                if (option.contractAddress && option.contractAddress.toLowerCase().indexOf(search.toLowerCase()) > -1) {
                    return true;
                }
                return false;
            },
            async getPricePerTx() {
                const {ERC20Airdropper} = this.contracts;
                this.pricePerTxInWei = await ERC20Airdropper.pricePerTx();
                this.pricePerTx = ethers.utils.formatEther(this.pricePerTxInWei);
            },
            nextStep(from) {
                if (from === 1) {
                    const skipToStep3 = this.totalStepsRequiredToSetupAirdrop === 2;
                    this.wizard.currentStep = skipToStep3 ? 3 : 2;
                } else {
                    this.wizard.currentStep = 3;
                }

                if (this.wizard.currentStep === 2) {
                    this.wizard.stepInfo = 'Increase Airdropper Token Allowance';
                } else {
                    this.wizard.stepInfo = 'Confirm Airdrop';
                }
            },
            goBack(from) {
                this.wizard.currentStep = from - 1;
            },
            startOver() {
                this.airdropComplete = false;
                this.airdropTxs = [];
                this.confirmedAirdropTxs = [];
                this.goBack(2);
            },
            async onSubmit() {
                if (this.form.token && this.form.csvData) {
                    this.form.csvData = this.form.csvData.replace(/\n$/, ''); // drop last newline

                    if (parseFloat(this.allowance) < parseFloat(this.totalValue)) {
                        alert('Allowance not enough');
                        return;
                    }

                    this.airdropping = true;

                    let nonce = await this.provider.getTransactionCount(this.account);

                    const chunks = _.chunk(this.csvDataFilteredForValidRowsOnly, this.mazBatchSize);

                    _.map(chunks, (chunk, idx) => {
                        console.log(idx + 1 > Number(this.credits) ? this.pricePerTxInWei : 0);

                        const addresses = chunk.map(vals => vals[0].replace(/\n$/, '').replace(/\r$/, '').trim());
                        const values = chunk.map(vals => ethers.utils.parseUnits(vals[1].replace(/\n$/, '').replace(/\r$/, '').trim(), this.decimals));

                        const {ERC20Airdropper} = this.contracts;
                        const contractCall = {
                            methodName: 'transfer',
                            params: [this.form.token, addresses, values]
                        };

                        const updateUIWhenDone = async tx => {
                            await tx.wait(2);
                            this.confirmedAirdropTxs.push(tx);

                            if (this.confirmedAirdropTxs.length === this.airdropTxs.length) {
                                this.airdropping = false;
                                this.form.csvData = null;
                                this.checkAllowance();
                                this.checkCredits();
                                this.airdropComplete = true;
                            }
                        };

                        const sendTransaction = async () => {
                            try {
                                const tx = await ERC20Airdropper.transfer(
                                    ...contractCall.params,
                                    {
                                        value: idx + 1 > Number(this.credits) ? this.pricePerTxInWei : 0,
                                        nonce: ++nonce,
                                        gasLimit: 500000,
                                    }
                                );

                                this.airdropTxs.push(`https://rinkeby.etherscan.io/tx/${tx.hash}`);
                                updateUIWhenDone(tx);
                                return tx.hash;
                            } catch (e) {
                                console.error(`onSubmit: ${e}`);
                                this.airdropping = false;
                                return null;
                            }
                        };

                        const {emitter, result} = notifyInstance.transaction({
                            sendTransaction,
                            contractCall
                        });

                        emitter.on("all", tx => {
                            console.log(`Emitter....`);
                            console.log(tx);
                        });
                    });
                }
            },

            async onValidateInputs() {
                console.log('onValidateInputs');

                if (!this.form.csvData) return false;

                let allValuesValid = null;
                let values = null;

                const csvArray = this.csvDataFilteredForValidRowsOnly;
                const addresses = csvArray.map(vals => vals[0].trim());

                try {
                    values = csvArray.map(vals => {
                        if (vals.length === 1) return '-1'; // No value has been supplied
                        if (vals.length === 2 && !vals[1]) return '-1'; // Empty value supplied
                        if (vals.length > 2) return '-1'; // Too many delimiters / values supplied
                        return ethers.utils.parseUnits(vals[1].trim(), this.decimals);
                    });
                    console.log('values', values);
                    const invalidValues = values.filter(value => value.toString() === '-1');
                    allValuesValid = !invalidValues.length;
                } catch (e) {
                    console.error(e);
                    allValuesValid = false;
                }

                let allAddressesValid = addresses.every(addrToCheck => {
                    if (!addrToCheck) return false;
                    try {
                        ethers.utils.getAddress(addrToCheck);
                        return true;
                    } catch (e) {
                        console.error(e);
                        return false;
                    }
                });

                console.log('Addresses', addresses);
                console.log('Addresses VALID', allAddressesValid);

                console.log('Values', values && values.map(value => value.toString()));
                console.log('Values VALID', allValuesValid);

                this.valid = allAddressesValid && allValuesValid;

                if (this.valid) {
                    this.rowLen = values.length;
                    this.totalValue = values && ethers.utils.formatUnits(values.reduce((accum, value) => accum.add(value), ethers.utils.bigNumberify('0')).toString(), this.decimals);
                    this.batchLen = Math.ceil(values.length / this.mazBatchSize);
                }
                return allAddressesValid && allValuesValid;
            },
            async checkAllowance() {
                console.log('checkAllowance');
                if (this.form.token && this.account) {
                    const airdropperAddress = utils.getContractAddressFromTruffleConf(ERC20Airdropper, this.chain.chainId);
                    const erc20 = new ethers.Contract(
                        this.form.token,
                        erc20Abi,
                        this.signer,
                    );

                    this.symbol = await erc20.symbol();
                    this.decimals = await erc20.decimals();

                    const weiBalance = (await erc20.balanceOf(this.account));
                    this.balance = ethers.utils.formatUnits(weiBalance, this.decimals);
                    console.log('balance', weiBalance.toString());
                    this.allowance = ethers.utils.formatUnits((await erc20.allowance(this.account, airdropperAddress)), this.decimals);
                    console.log('allowance', this.allowance.toString());
                } else {
                    this.decimals = '';
                    this.symbol = '';
                    this.balance = '';
                    this.allowance = '';
                }
            },
            async approveAllowance() {
                console.log('approveAllowance');
                if (this.form.token && this.account) {
                    this.approving = true;
                    const airdropperAddress = utils.getContractAddressFromTruffleConf(ERC20Airdropper, this.chain.chainId);
                    const erc20 = new ethers.Contract(
                        this.form.token,
                        erc20Abi,
                        this.signer,
                    );

                    const contractCall = {
                        methodName: 'approve',
                        params: [airdropperAddress, ethers.utils.parseUnits(this.totalValue, this.decimals)]
                    };

                    const updateUIWhenDone = async tx => {
                        this.approveTx = `https://rinkeby.etherscan.io/tx/${tx.hash}`;

                        const receipt = await tx.wait(2);
                        console.log('Allowance receipt', receipt);

                        // Refresh UI
                        this.nextStep(2);
                        this.checkAllowance();
                        this.approving = false;
                        this.approveTx = null;
                    };

                    const sendTransaction = async () => {
                        try {
                            const tx = await erc20.approve(...contractCall.params, {gasLimit: 500000,});
                            updateUIWhenDone(tx);
                            return tx.hash;
                        } catch (e) {
                            this.approving = false;
                            this.approveTx = null;
                            return null;
                        }
                    };

                    const {emitter, result} = notifyInstance.transaction({
                        sendTransaction,
                        contractCall
                    });

                    emitter.on("all", tx => {
                        console.log(`Emitter....`);
                        console.log(tx);
                    });
                }
            },
            async checkCredits() {
                console.log('checking credits');
                const {ERC20Airdropper} = this.contracts;
                this.credits = parseInt((await ERC20Airdropper.credits(this.account)).toString());
            },
            csvDataToArrays(data) {
                return data
                    .split('\n')
                    .map(v => v.split(','));
            },
        },
        async mounted() {
            if (this.contracts) {
                await this.checkCredits();
                this.getPricePerTx();

                if (this.form.token) {
                    await this.checkAllowance();
                }
            }
        },
        watch: {
            'form.file': function (newVal, oldVal) {
                if (newVal) {
                    const reader = new FileReader();
                    const onloadend = () => {
                        this.form.csvData = reader.result;
                        this.onValidateInputs();
                    };
                    reader.onloadend = onloadend;
                    reader.readAsBinaryString(newVal);
                }
            },
            'contracts': async function (newVal, oldVal) {
                if (newVal && !oldVal) {
                    await this.checkCredits();
                    this.getPricePerTx();

                    if (this.form.token) {
                        await this.checkAllowance();
                    }
                }
            }
        }
    };
</script>

<style scoped>

</style>
