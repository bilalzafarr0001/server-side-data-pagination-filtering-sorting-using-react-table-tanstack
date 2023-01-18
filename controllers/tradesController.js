const Trades = require("../models/Trades");
const Materials = require("../models/Materials");

const { encrypt, decrypt } = require("../utils/encrypt-decrypt");

const fetchCompanies = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = req.query.skip ? parseInt(req.query.skip) : 0;
    const searchNumber = req.query.number ? req.query.number : "";
    const searchStatus = req.query.status ? req.query.status : "";
    const sortBy = req.query.sortBy;
    const sortDesc = req.query.sortDesc;
    let val = 1;
    let sortObject = {};
    if (sortDesc == "true") {
      val = -1;
    }
    if (sortBy == "undefined" || sortDesc == "undefined") {
      sortObject["createdAt"] = 1;
    } else {
      sortObject[sortBy] = val;
    }
    console.log(
      limit,
      offset,
      searchNumber,
      searchStatus,
      sortBy,
      sortDesc,
      sortObject,
      val
    );

    let tradesCollection;
    let tradesCollectionCount;

    if (searchNumber || searchStatus) {
      tradesCollection = await Materials.find({
        $and: [
          { number: { $regex: searchNumber } },
          { status: { $regex: searchStatus } },
        ],
      })
        .skip(offset)
        .limit(limit)
        .sort(sortObject);
      tradesCollectionCount = await Materials.count({
        $and: [
          { number: { $regex: searchNumber } },
          { status: { $regex: searchStatus } },
        ],
      });
    } else {
      tradesCollection = await Materials.find({})
        .skip(offset)
        .limit(limit)
        .sort(sortObject);

      tradesCollectionCount = await Materials.count();
    }

    const totalPages = Math.ceil(tradesCollectionCount / limit);
    const currentPage = Math.ceil(tradesCollectionCount % offset);

    res.status(200).send({
      data: tradesCollection,
      paging: {
        total: tradesCollectionCount,
        page: currentPage,
        pages: totalPages,
      },
    });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({
      data: null,
    });
  }
};

const fetchCompaniesCursor = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const cursor = req.query.cursor;

    let decryptedCursor;
    let tradesCollection;
    if (cursor) {
      decryptedCursor = decrypt(cursor);

      let decrypedDate = new Date(decryptedCursor * 1000);

      tradesCollection = await Trades.find({
        time: {
          $lt: new Date(decrypedDate),
        },
      })
        .sort({ time: -1 })
        .limit(limit + 1)
        .exec();
    } else {
      tradesCollection = await Trades.find({})
        .sort({ time: -1 })
        .limit(limit + 1);
    }

    const hasMore = tradesCollection.length === limit + 1;

    let nextCursor = null;
    if (hasMore) {
      const nextCursorRecord = tradesCollection[limit];

      var unixTimestamp = Math.floor(nextCursorRecord.time.getTime() / 1000);

      nextCursor = encrypt(unixTimestamp.toString());
      tradesCollection.pop();
    }

    res.status(200).send({
      data: tradesCollection,
      paging: {
        hasMore,
        nextCursor,
      },
    });
  } catch (e) {
    console.log("Error", e);
    res.status(500).send({
      data: null,
      error: e,
    });
  }
};

module.exports = {
  fetchCompanies,
  fetchCompaniesCursor,
};
