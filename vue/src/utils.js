import deployedAtBlock from "./truffleconf/deployedAtBlock";

function getContractAddressFromTruffleConf(truffleConf, chainId) {
    if(!truffleConf || !chainId) return '';
    const {networks} = truffleConf;
    if (networks[chainId.toString()]) {
        const address = networks[chainId.toString()].address;
        return address ? address : '';
    }
    return '';
}

async function fetchEvents(eventName, contract, provider, fromBlock) {
    const eventFilter = contract.filters[eventName]();
    eventFilter.fromBlock = fromBlock;
    eventFilter.toBlock = "latest";

    let events = (await provider.getLogs(eventFilter)) || [];
    return events.map(event => {
        const parsedEvent = contract.interface.parseLog(event);
        return parsedEvent.values;
    });
}

function getDeploymentBlock(contractName, chainId) {
    return deployedAtBlock[contractName][chainId];
}

export default {
    getContractAddressFromTruffleConf,
    getDeploymentBlock,
    fetchEvents
}