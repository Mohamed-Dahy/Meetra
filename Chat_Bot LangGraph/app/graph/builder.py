from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode, tools_condition

from app.graph.state import ChatState
from app.graph.nodes import agent_node, tools


def build_graph():
    graph = StateGraph(ChatState)

    # Nodes
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(tools))

    # Entry
    graph.set_entry_point("agent")

    # agent → tools (if tool calls present) OR → END
    graph.add_conditional_edges("agent", tools_condition)

    # tools always loop back to agent so the model can react to results
    graph.add_edge("tools", "agent")

    return graph.compile()


chatbot = build_graph()
