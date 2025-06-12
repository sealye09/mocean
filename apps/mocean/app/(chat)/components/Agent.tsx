import { AgentModel } from "@mocean/mastra/prismaType";

import { useStore } from "@/app/store/useStore";

interface AgentSelectProps {
  onClick: (agent: AgentModel) => void;
}

const AgentSelect: React.FC<AgentSelectProps> = ({ onClick }) => {
  const { agentList } = useStore();
  return (
    <div>
      {agentList.map((agent) => (
        <div key={agent.id} onClick={() => onClick(agent)}>
          <div>{agent.name}</div>
        </div>
      ))}
    </div>
  );
};

export default AgentSelect;
