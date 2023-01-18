import React, {
  useState,
  useEffect,
  useCallback,
  Fragment,
  useMemo,
  useRef,
} from "react";
import _ from "lodash";
import moment from "moment";
import Table from "./components/Table";
import "./App.css";
import Filter from "./components/Table/Filter";
import axios from "axios";

const initialSearchParams = {
  number: "",
  status: "",
};

function App() {
  const [pageCount, setPageCount] = useState(0);
  const [data, setData] = useState([]);
  const fetchIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // search filter and its params
  const [filter, setFilter] = useState(initialSearchParams);
  const [searchParams, setSearchParams] = useState({});

  const getParams = (param) => {
    const params = {};
    if (param.number) {
      params["number"] = param.number;
    }
    if (param.status) {
      params["status"] = param.status;
    }
    return params;
  };

  // Fetch data by sending params to backens using query
  const fetchAPIData = async ({ limit, skip, params, sort }) => {
    try {
      setLoading(true);
      console.log(
        `http://localhost:4500/companies?limit=${limit}&skip=${skip}&sortBy=${sort[0]?.id}&sortDesc=${sort[0]?.desc}`
      );
      const response = await axios.get(
        `http://localhost:4500/companies?limit=${limit}&skip=${skip}&sortBy=${sort[0]?.id}&sortDesc=${sort[0]?.desc}`,
        { params }
      );

      setData(response.data.data);
      console.log(
        "RESPONSE FROM API :::: ",
        response.data.data,
        response.data.paging.pages
      );
      setPageCount(response.data.paging.pages);
      setLoading(false);
    } catch (e) {
      console.log("Error while fetching", e);
      // setLoading(false)
    }
  };

  const fetchData = useCallback(
    ({ pageSize, pageIndex, params, sortBy }) => {
      console.log(
        "pageSize, pageIndex, params, sortBy",
        pageSize,
        pageIndex,
        params,
        sortBy
      );
      const fetchId = ++fetchIdRef.current;
      setLoading(true);

      if (fetchId === fetchIdRef.current) {
        fetchAPIData({
          limit: pageSize,
          skip: params.number || params.status ? 0 : pageSize * pageIndex,
          params: params,
          sort: sortBy,
        });
      }
    },
    [searchParams]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.currentTarget;
    setFilter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleApplyFilter = () => {
    const params = getParams(filter);
    setSearchParams(params);
  };

  const handleCancelFilter = () => {
    setSearchParams(initialSearchParams);
  };

  // const _handleSearch = _.debounce(
  //   (search) => {
  //     setSearchTerm(search);
  //   },
  //   1500,
  //   {
  //     maxWait: 1500,
  //   }
  // );

  const columns = useMemo(() => [
    { Header: "Number", accessor: "number", show: true },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: (cellInfo) => {
        return (
          <Fragment>
            {moment(cellInfo.row.original.createdAt).format("Do MMM YYYY")}
          </Fragment>
        );
      },
      show: true,
    },
    {
      Header: "Requested Date",
      accessor: "requestedDate",
      Cell: (cellInfo) => {
        return (
          <Fragment>
            {moment(cellInfo.row.original.requestedDate).format("Do MMM YYYY")}
          </Fragment>
        );
      },
      show: true,
    },
    { Header: "Status", accessor: "status", show: true },
    {
      Header: "Rejected Reson",
      accessor: "rejectionReason",
      show: true,
    },
  ]);

  return (
    <div className="container mx-auto flex flex-col">
      {/* <div className="mt-3">
        <input
          id="status"
          name="status"
          type="text"
          onChange={(e) => _handleSearch(e.target.value)}
          placeholder="Search By Status"
          className="appearance-none block w-1/4 float-right px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <input
          id="number"
          name="number"
          type="text"
          onChange={(e) => _handleSearch(e.target.value)}
          placeholder="Search By MR-Number"
          className="appearance-none block w-1/4 float-right px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div> */}
      <h1 className="mt-3 ">Search :</h1>
      <Filter
        onApplyBtnClick={handleApplyFilter}
        onCancelBtnClick={handleCancelFilter}
      >
        <input
          id="TextInput-1"
          label="Number"
          name="number"
          placeholder="Search By MR-Number"
          className="mt-5 appearance-none block w-1/4 float-left px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={filter.number}
          onChange={handleInputChange}
        />
        <input
          id="TextInput-2"
          label="Status"
          name="status"
          placeholder="Search By Status"
          className="ml-4 mt-5 mb-3  appearance-none block w-1/4 float-left px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={filter.status}
          onChange={handleInputChange}
        />
      </Filter>
      <div className="flex justify-center mt-8">
        <Table
          params={searchParams}
          pageCount={pageCount}
          fetchData={fetchData}
          columns={columns}
          loading={loading}
          data={data}
        />
      </div>
    </div>
  );
}

export default App;
