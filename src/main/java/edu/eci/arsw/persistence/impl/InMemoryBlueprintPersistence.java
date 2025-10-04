/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.persistence.impl;

import edu.eci.arsw.blueprints.controllers.BluePrintError;
import edu.eci.arsw.model.Blueprint;
import edu.eci.arsw.model.Point;
import edu.eci.arsw.persistence.BlueprintNotFoundException;
import edu.eci.arsw.persistence.BlueprintPersistenceException;
import edu.eci.arsw.persistence.BlueprintsPersistence;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 *
 * @author hcadavid
 */
@Repository
public class InMemoryBlueprintPersistence implements BlueprintsPersistence{

    private final ConcurrentHashMap<Tuple<String,String>,Blueprint> blueprints=new ConcurrentHashMap<>();

    public InMemoryBlueprintPersistence() {
        Point[] pts1 = new Point[]{new Point(10, 10), new Point(20, 20)};
        Blueprint bp1 = new Blueprint("andres", "house", pts1);
        blueprints.put(new Tuple<>(bp1.getAuthor(), bp1.getName()), bp1);

        // Plano 2 - Autor: john (mismo autor que bp1)
        Point[] pts2 = new Point[]{new Point(30, 30), new Point(40, 40)};
        Blueprint bp2 = new Blueprint("andres", "car", pts2);
        blueprints.put(new Tuple<>(bp2.getAuthor(), bp2.getName()), bp2);

        // Plano 3 - Autor: alice (autor diferente)
        Point[] pts3 = new Point[]{new Point(50, 50), new Point(60, 60)};
        Blueprint bp3 = new Blueprint("alice", "tree", pts3);
        blueprints.put(new Tuple<>(bp3.getAuthor(), bp3.getName()), bp3);
        
    }    
    
    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        Tuple<String, String> key = new Tuple<>(bp.getAuthor(), bp.getName());
        Blueprint existing = blueprints.putIfAbsent(key, bp);
        if (existing != null) {
            throw new BlueprintPersistenceException("The given blueprint already exists: "+bp);
        }
    }

    @Override
    public void modifyBluePrint(Blueprint bp) throws BlueprintPersistenceException {
        Tuple<String, String> key = new Tuple<>(bp.getAuthor(), bp.getName());
        Blueprint existing = blueprints.replace(key, bp);
        if (existing == null) {
            throw new BlueprintPersistenceException("The given blueprint does not exist: " + bp);
        }
    }

    @Override
    public Blueprint getBlueprint(String author, String bprintname) throws BlueprintNotFoundException {
        Blueprint blueprint = blueprints.get(new Tuple<>(author, bprintname));
        if (blueprint == null) {
            throw new BlueprintNotFoundException("Blueprint not found for author: " + author + " and name: " + bprintname);
        }
        return deepCopyBlueprint(blueprint);
    }

    @Override
    public Set<Blueprint> getAllBlueprints() throws BlueprintPersistenceException {
        Set<Blueprint> result = new HashSet<>();
        for (Blueprint bp : blueprints.values()) {
            result.add(deepCopyBlueprint(bp));
        }
        if (result.isEmpty()) {
            throw new BlueprintPersistenceException("No blueprints found");
        }
        return result;
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> result = new HashSet<>();
        for (Blueprint bp : blueprints.values()) {
            if (bp.getAuthor().equals(author)) {
                result.add(deepCopyBlueprint(bp));
            }
        }
        if (result.isEmpty()) {
            throw new BlueprintNotFoundException("No blueprints found for author: " + author);
        }
        return result;
    }

    @Override
    public Blueprint setBlueprint(String author, String name, Point[] puntos) {
        try {
            Point[] pcopy = deepCopyPoints(puntos);
            return new Blueprint(author, name, pcopy);
        } catch (BluePrintError ex) {
            throw new BluePrintError("Error setting blueprint: " + ex);
        }
    }

    private Blueprint deepCopyBlueprint(Blueprint bp) {
        Point[] pts = bp.getPoints().toArray(new Point[0]);
        Point[] ptsCopy = deepCopyPoints(pts);
        return new Blueprint(bp.getAuthor(), bp.getName(), ptsCopy);
    }

    private Point[] deepCopyPoints(Point[] pts) {
        if (pts == null) return null;
        Point[] copy = new Point[pts.length];
        for (int i = 0; i < pts.length; i++) {
            Point p = pts[i];
            copy[i] = new Point(p.getX(), p.getY());
        }
        return copy;
    }
}
