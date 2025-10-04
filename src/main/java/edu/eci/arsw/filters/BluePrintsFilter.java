package edu.eci.arsw.filters;


import edu.eci.arsw.model.Blueprint;

public interface BluePrintsFilter {
    Blueprint applyFilter(Blueprint bp);
}
