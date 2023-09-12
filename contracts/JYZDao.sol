// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract JYZDao {
    IERC20 public token;
    struct Topic {
        bytes32 topicHash; // topic content hash
        int32 passPercent;
        int256 currentVotesNum; // int, maybe negative
        bool isPass;
        string desc; // short intro or title
        uint32 endTime;
    }
    int256 public immutable totalVotesNum; // token's totalSupply
    address public immutable owner;
    mapping(bytes32 => Topic) public topicMap;
    mapping(bytes => bool) public votedMap; // the key is sender + topicHash

    event VoteResult(bytes32 topicHash, bool isPass, int256 currentVotesNum);
    error VoteOver(bytes32 topicHash, bool isPass, int256 currentVotesNum);

    modifier onlyOwner() {
        require(msg.sender == owner, "Invalid owner");
        _;
    }
    modifier voteIntime(bytes32 topicHash) {
        Topic memory topic = topicMap[topicHash];
        require(block.timestamp <= topic.endTime, "Vote time is over");
        if (block.timestamp <= topic.endTime) {
            _;
        } else {
            emit VoteResult(
                topic.topicHash,
                topic.isPass,
                topic.currentVotesNum
            );
            revert VoteOver(
                topic.topicHash,
                topic.isPass,
                topic.currentVotesNum
            );
        }
    }

    constructor(address _tokenAddr) {
        owner = msg.sender;
        token = IERC20(_tokenAddr);
        totalVotesNum = int256(token.totalSupply());
    }

    function addTopic(
        bytes32 topicHash,
        int32 passPercent,
        string calldata desc,
        uint32 endTime
    ) public onlyOwner {
        Topic memory topic;
        require(topicMap[topicHash].topicHash == 0, "Topic is already exist");
        topic.topicHash = topicHash;
        topic.passPercent = passPercent;
        topic.desc = desc;
        topic.endTime = endTime;
        topicMap[topicHash] = topic;
    }

    function delTopic(bytes32 topicHash) public onlyOwner {
        delete topicMap[topicHash];
    }

    function getTopic(bytes32 topicHash) public view returns (Topic memory) {
        return topicMap[topicHash];
    }

    function _dealTopic(bytes32 topicHash, bool isFavor) private {
        require(topicMap[topicHash].topicHash != 0, "Topic not exist");
        require(
            votedMap[abi.encode(msg.sender, topicHash)] == false,
            "User already Voted"
        );
        int256 voteNum = int256(token.balanceOf(msg.sender));
        int256 currentVotesNum = topicMap[topicHash].currentVotesNum;
        if (isFavor) {
            currentVotesNum += voteNum;
        } else {
            currentVotesNum -= voteNum;
        }

        int256 currentPercent = (currentVotesNum * 100) / totalVotesNum; // 90 means 90%, no point
        if (currentPercent < topicMap[topicHash].passPercent) {
            topicMap[topicHash].isPass = false;
        } else {
            topicMap[topicHash].isPass = true;
        }
        topicMap[topicHash].currentVotesNum = currentVotesNum;
        votedMap[abi.encode(msg.sender, topicHash)] = true;
    }

    function favorTopic(bytes32 topicHash) external voteIntime(topicHash) {
        _dealTopic(topicHash, true);
    }

    function opposedTopic(bytes32 topicHash) external voteIntime(topicHash) {
        _dealTopic(topicHash, false);
    }
}
