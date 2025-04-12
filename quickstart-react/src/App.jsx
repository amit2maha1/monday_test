import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
const monday = mondaySdk();
import "@vibe/core/tokens";
import OAuth from "./OAuth";
// Explore more Monday React Components here: https://style.monday.com/
import { AttentionBox, TextField, Button, Flex, Loader } from "@vibe/core";
import { get, post, put, del } from "./api";
// Usage of mondaySDK example, for more information visit here: https://developer.monday.com/apps/docs/introduction-to-the-sdk/

// Set API token for server-side calls

const App = () => {
  const [context, setContext] = useState();
  const [itemId, setItemId] = useState(null);
  const [factor, setFactor] = useState("");
  const [originalFactor, setOriginalFactor] = useState(""); // Store the initial value
  const [history, setHistory] = useState([]); // Placeholder for past calculations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchCalcHistory = async () => {
    try {
      setLoading(true);
      const response = await get(`monday/get_calc_history?boardId=${context.boardId}&itemId=${itemId}`);
      console.log(response, 'calc history res')
      setHistory(response || []); // Set the history value from the response
      setLoading(false);
    } catch (error) {
      console.error("Error fetching calculation history:", error);
      setLoading(false);
      setError("Failed to fetch calculation history. Check console for details.");
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("monday_access_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();
    // Notice this method notifies the monday platform that user gains a first value in an app.
    // Read more about it here: https://developer.monday.com/apps/docs/mondayexecute#value-created-for-user/
    monday.execute("valueCreatedForUser");

    // TODO: set up event listeners, Here`s an example, read more here: https://developer.monday.com/apps/docs/mondaylisten/
    monday.listen("context", async (res) => {
      setContext(res.data);
      console.log("Context received:", res.data); // Log context for debugging
     
      if (res.data.itemId) {
        console.log("Item ID found in context:", res.data.itemId);
        setItemId(res.data.itemId);
      } else {
        console.error("Item ID not found in context");
        setError("Item ID not found in context. Is this running in an Item View?");
      }
    });
  }, []);

  // Fetch initial factor when itemId is available
  useEffect(() => {
 
    console.log("Fetching factor for item:", itemId, "board id", context?.boardId);
    if (!itemId) return; // Don't run if itemId is not yet set

    const fetchFactor = async () => {

      try {
        setLoading(true);
        let factorRes = await get(`monday/get_factor?boardId=${context.boardId}&itemId=${itemId}`)
        setFactor(factorRes.factor || ""); // Set the factor value from the response
        console.log(factorRes, 'factor res')
        setLoading(false);
  
      } catch (error) {
        console.error("Error fetching factor:", error);
        setLoading(false);
        setError("Failed to fetch factor. Check console for details.");
      }
 
    };

    fetchFactor();
    fetchCalcHistory();
  }, [itemId, context?.boardId]);

  const handleFactorChange = useCallback((value) => {
    console.log("Factor changed tasdsado:", value);
    setFactor(value);
  }, []);

  const handleSaveFactor = useCallback(async () => {
    console.log("Saving factor for item:", factor);
    try {
      setLoading(true);
      const response = await post("monday/save_factor", {
        itemId,
        boardId: context.boardId,
        factor,
      })
      console.log(response, 'save factor res')

      fetchCalcHistory(); // Fetch the updated calculation history after saving the factor
      setLoading(false);
      if (response.message === "Factor saved successfully") {
        setOriginalFactor(factor); // Update original factor to the new value
        // alert("Factor saved successfully!");
      }
    } catch (error) {
      
      console.error("Error saving factor:", error);
      setLoading(false);
      setError("Failed to save factor. Check console for details.");
    }


  }, [itemId, factor, originalFactor, context]);

  const handleRecalculate = useCallback(async () => {
    setLoading(true);
    const response = await post("monday/save_factor", {
      itemId,
      boardId: context.boardId, 
      originalFactor: factor || originalFactor,
    })
    console.log(response, 'save factor res')
    fetchCalcHistory(); 
    setLoading(false);

    // alert("Recalculation logic not yet implemented.");
  }, [itemId, factor]);

  if (!isAuthenticated) {
    return <OAuth />;
  }

  return (
    <div className="App">
      {loading && <Loader size={Loader.sizes.LARGE} />}
      {error && <AttentionBox title="Error" text={error} type={AttentionBox.types.DANGER} />}

      {(
        <>
          <Flex direction={Flex.directions.COLUMN} gap={Flex.gaps.MEDIUM} align={Flex.align.START} style={{ padding: '16px' }}>
             <TextField
               title="Multiplication Factor"
               value={factor}
               onChange={handleFactorChange}
               placeholder="Enter factor"
               type="number"
               // Consider adding validation (e.g., type="number") if applicable
             />
             <Flex gap={Flex.gaps.SMALL}>
                 <Button onClick={handleSaveFactor} disabled={factor === originalFactor || loading}>
                   Save Factor
                 </Button>
                 <Button onClick={handleRecalculate} kind={Button.kinds.SECONDARY} disabled={loading}>
                   Recalculate Now
                 </Button>
             </Flex>

             {/* Placeholder for History Table */}
             <div style={{ marginTop: '20px', width: '100%' }}>
                <h3>Calculation History</h3>

                {/* TODO: Implement Table component here using `history` state */}
                {history.length > 0 ? (
                    <table>
                        <thead>
                          <tr>
                              <th>Factor</th>
                              <th>Result</th>
                              <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((entry, index) => (
                              <tr key={index}>
                                <td>{entry.factor}</td>
                                <td>{entry.result}</td>
                                <td>{new Date(entry.createdAt).toLocaleString()}</td>
                              </tr>
                          ))}
                        </tbody>
                    </table>
                ) : (
                   <p>No history available yet.</p>
                )}
             </div>
          </Flex>
        </>
      )}

      {!itemId && !loading && !error && (
         <AttentionBox title="Waiting for Context" text="Loading item information..." type={AttentionBox.types.INFO} />
      )}
    </div>
  );
};

export default App;
