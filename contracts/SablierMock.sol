pragma solidity ^0.5.0;

//import "@sablier/protocol/contracts/Sablier.sol";
import "./IERC1620.sol";

contract SablierMock is IERC1620 {

    function balanceOf(uint256 streamId, address who) external view returns (uint256 balance) {
        return 123;
    }

    function getStream(uint256 streamId)
    external
    view
    returns (
        address sender,
        address recipient,
        uint256 deposit,
        address token,
        uint256 startTime,
        uint256 stopTime,
        uint256 remainingBalance,
        uint256 ratePerSecond
    ) {
        return (address(0x0), address(0x0), 123, address(0x0), 1, 2, 1, 1);
    }

    function createStream(address recipient, uint256 deposit, address tokenAddress, uint256 startTime, uint256 stopTime)
    external
    returns (uint256 streamId) {
        return 6;
    }

    function withdrawFromStream(uint256 streamId, uint256 funds) external returns (bool) {
        return true;
    }

    function cancelStream(uint256 streamId) external returns (bool) {
        return true;
    }
}