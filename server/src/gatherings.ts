
export interface Gathering {
  id: string;
  members: Set<string>;
}

class Gatherings {
  private data = new Map<string, Gathering>();

  create = (id: string): Gathering | null => {
    if (this.data.get(id)) {
      return null;
    }

    this.data.set(id, {id, members: new Set<string>()});

    return this.data.get(id);
  };

  get = (id: string): Gathering | null => {
    return this.data.get(id);
  };

  addMember = (gatheringId: string, name: string): Gathering | null => {
    const gathering = this.data.get(gatheringId);
    if (gathering?.members.has(name)) {
      return null;
    }

    gathering?.members.add(name);

    return gathering || null;
  };
};

export default Gatherings;
