/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.services;

import edu.eci.arsw.blueprints.controllers.ResourceNotFoundException;
import edu.eci.arsw.filters.BluePrintsFilter;
import edu.eci.arsw.model.Blueprint;
import edu.eci.arsw.model.Point;
import edu.eci.arsw.persistence.BlueprintNotFoundException;
import edu.eci.arsw.persistence.BlueprintPersistenceException;
import edu.eci.arsw.persistence.BlueprintsPersistence;

import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * @author hcadavid
 */
@Service
public class BluePrintServices {
   
    @Autowired
    BlueprintsPersistence bpp=null;

    @Autowired
    BluePrintsFilter filter;

    public void addNewBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        bpp.saveBlueprint(bp);
    }

    public void modifyBluePrint(Blueprint bp) throws BlueprintPersistenceException {
        bpp.modifyBluePrint(bp);
    }
    
    public Set<Blueprint> getAllBlueprints() throws ResourceNotFoundException, BlueprintPersistenceException {
        Set<Blueprint> blueprints = bpp.getAllBlueprints();

        if (blueprints == null || blueprints.isEmpty()) {
            throw new ResourceNotFoundException();
        }

        Set<Blueprint> filtered = new java.util.HashSet<>();
        for (Blueprint bp : blueprints) {
            filtered.add(filter.applyFilter(bp));
        }
        return filtered;
    }
    
    /**
     * 
     * @param author blueprint's author
     * @param name blueprint's name
     * @return the blueprint of the given name created by the given author
     * @throws BlueprintNotFoundException if there is no such blueprint
     */
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        Blueprint blueprint = bpp.getBlueprint(author, name);

        if (blueprint == null) {
            throw new BlueprintNotFoundException("Blueprint not found for author: " + author + " and name: " + name);
        }
        return filter.applyFilter(blueprint);
    }

    public Blueprint getBlueprintRaw(String author, String name) throws BlueprintNotFoundException {
        Blueprint blueprint = bpp.getBlueprint(author, name);
        if (blueprint == null) throw new BlueprintNotFoundException("Blueprint not found for author: " + author + " and name: " + name);
        return blueprint;
    }
    
    /**
     * 
     * @param author blueprint's author
     * @return all the blueprints of the given author
     * @throws BlueprintNotFoundException if the given author doesn't exist
     */
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> blueprints = bpp.getBlueprintsByAuthor(author);

        if (blueprints == null || blueprints.isEmpty()) {
            throw new BlueprintNotFoundException("No blueprints found for author: " + author);
        }

        Set<Blueprint> filtered = new java.util.HashSet<>();
        for (Blueprint bp : blueprints) {
            filtered.add(filter.applyFilter(bp));
        }

        return filtered;
    }

    public void removeBlueprint(String author, String name) throws BlueprintNotFoundException, BlueprintPersistenceException {
        bpp.deleteBlueprint(author, name);
    }
}
