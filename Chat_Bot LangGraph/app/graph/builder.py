from langgraph.graph import StateGraph, END
from app.graph.state import ChatState
from app.graph.nodes import agent_node

def build_graph():
    graph = StateGraph(ChatState)
    graph.add_node("agent", agent_node)
    graph.set_entry_point("agent")
    graph.add_edge("agent", END)
    return graph.compile()

chatbot = build_graph()