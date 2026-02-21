interface RequirementDetailsProps {
    requirement: {
      id: string;
      title: string;
      type: string;
      description: string;
      deadline: string;
      status: string;
      formatRequirements: string[];
      maxFileSize: string;
      requiredFields: string[];
    };
  }
  
  export default function RequirementDetails({ requirement }: RequirementDetailsProps) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">{requirement.title}</h2>
            <p className="text-sm text-muted-foreground">{requirement.type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            requirement.status === 'Pending' ? 'bg-warning/10 text-warning' :
            requirement.status === 'In Review'? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
          }`}>
            {requirement.status}
          </span>
        </div>
  
        <p className="text-sm text-foreground mb-6">{requirement.description}</p>
  
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Format Requirements</h3>
            <ul className="space-y-2">
              {requirement.formatRequirements.map((format, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {format}
                </li>
              ))}
            </ul>
          </div>
  
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Required Information</h3>
            <ul className="space-y-2">
              {requirement.requiredFields.map((field, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
        </div>
  
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Deadline</p>
              <p className="text-sm font-medium text-foreground">{requirement.deadline}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Max File Size</p>
              <p className="text-sm font-medium text-foreground">{requirement.maxFileSize}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }